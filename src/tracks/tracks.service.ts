import {
  Injectable,
  BadGatewayException,
  BadRequestException,
  HttpException,
  Inject,
} from '@nestjs/common';
import { createWriteStream, readFileSync, unlink } from 'fs';
import { SpotifyToYoutubeService } from 'src/spotify-to-youtube/spotify-to-youtube.service';
import { join } from 'path';
import { Track } from './entities/track.entity';
import { SupabaseClient } from '@supabase/supabase-js';
import ytdl from 'ytdl-core';
import { EntityType } from '../albums/schemas/album.schema';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { SpotifyApiService } from '../spotify-api/spotify-api.service';
import { TrackRepository } from '../abstract/abstract';
import { Response } from 'express';

@Injectable()
export class SpotifyTrackRepository implements TrackRepository {
  constructor(
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    private readonly spotifyApiService: SpotifyApiService,
    private readonly spotifyToYoutubeService: SpotifyToYoutubeService,
    private readonly supabaseClient: SupabaseClient,
  ) {}

  async getAudioContent(spotifyId: string, response: Response) {
    if (await this.fileExistInSupabaseBucket(spotifyId)) {
      const { data, error } = await this.supabaseClient.storage
        .from('tracks')
        .createSignedUrl(spotifyId, 600);
      if (error) throw new BadGatewayException();
      response.redirect(data!.signedUrl);
    } else {
      const youtubeId =
        await this.spotifyToYoutubeService.convertSpotifyIdToYoutubeId(
          spotifyId,
        );
      try {
        ytdl(youtubeId, {
          requestOptions: {
            headers: {
              cookie: process.env.YOUTUBE_COOKIES,
            },
          },
          filter: 'audioonly',
          quality: 'highestaudio',
        })
          .pipe(
            createWriteStream(
              join(process.cwd(), 'audio', spotifyId + '.opus'),
              {
                flags: 'w',
              },
            ),
          )
          .on('finish', () => {
            const file = readFileSync(
              join(process.cwd(), 'audio', spotifyId + '.opus'),
            );
            this.supabaseClient.storage
              .from('tracks')
              .upload(spotifyId, file, { contentType: 'audio/ogg' });
            response.setHeader('Content-Type', 'audio/ogg');
            response.send(file);
            response.on('finish', () => {
              unlink(
                join(process.cwd(), 'audio', spotifyId + '.opus'),
                () => {},
              );
            });
          });
      } catch (error) {
        if (!(error instanceof HttpException)) console.error(error);
        throw new BadGatewayException();
      }
    }
  }

  private async fileExistInSupabaseBucket(filename: string): Promise<boolean> {
    const { data, error } = await this.supabaseClient.storage
      .from('tracks')
      .list();
    if (error) return false;

    for (let file of data) {
      if (file.name == filename) return true;
    }

    return false;
  }

  async getMetadata(id: string): Promise<Track> {
    try {
      return await this.findOneTrackWithFormat(id);
    } catch (error) {
      if (error?.body?.error?.status == 400) throw new BadRequestException();
      if (!(error instanceof HttpException)) console.error(error);
      throw new BadGatewayException();
    }
  }

  async findOneTrackWithFormat(id: string): Promise<Track> {
    const cachedResult = await this.cacheManager.get(`track_${id}`);
    if (cachedResult) return cachedResult as Track;

    const fullTrackObject = await this.findOneTrack(id);
    const track = {
      id: fullTrackObject.id,
      name: fullTrackObject.name,
      type: EntityType.track,
      duration_ms: fullTrackObject.duration_ms,
      images: fullTrackObject.album.images,
      artists: fullTrackObject.artists.map((e) => {
        return { id: e.id, name: e.name };
      }),
    };
    this.cacheManager.set(`track_${id}`, track);
    return track;
  }

  async findOneTrack(id: string): Promise<SpotifyApi.SingleTrackResponse> {
    try {
      const track = (await this.spotifyApiService.spotifyWebApi.getTrack(id))
        .body;
      return track;
    } catch (error) {
      if (!(error instanceof HttpException)) console.error(error);
      throw new BadGatewayException();
    }
  }

  async getTop50(): Promise<Track[]> {
    const TOP50_PLAYLIST_ID = '37i9dQZEVXbLdGSmz6xilI';
    return await this.getPlaylistTracks(TOP50_PLAYLIST_ID);
  }

  async getPlaylistTracks(id: string): Promise<Track[]> {
    const cachedResult = await this.cacheManager.get(`playlist_${id}`);
    if (cachedResult) return cachedResult as Track[];

    let tracksResponse = (
      await this.spotifyApiService.spotifyWebApi.getPlaylistTracks(id)
    ).body.items;
    tracksResponse = tracksResponse.filter((e) => e && e.track);
    const tracks = tracksResponse.map((e) => {
      return {
        id: e!.track!.id,
        name: e!.track!.name,
        type: EntityType.track,
        images: e!.track!.album.images,
        duration_ms: e!.track!.duration_ms,
        artists: e!.track!.artists.map(({ id, name }) => {
          return { id, name };
        }),
      };
    });
    tracksResponse.forEach((track) => {
      this.cacheManager.set(`track_${track.track.id}`, track.track);
    });

    this.cacheManager.set(`playlist_${id}`, tracks);
    return tracks;
  }

  async getManyMetadata(ids: string[]): Promise<Track[]> {
    let queryIds = [];
    let responseArray: Track[] = [];
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      const cacheResult = await this.cacheManager.get(`track_${id}`);
      if (cacheResult) responseArray.push(cacheResult as Track);
      else queryIds.push(id);
    }

    let trackResponse: Track[] = [];
    if (queryIds.length > 0)
      trackResponse = (
        await this.spotifyApiService.spotifyWebApi.getTracks(queryIds)
      ).body.tracks.map((track) => {
        return {
          id: track.id,
          name: track.name,
          type: EntityType.track,
          images: track.album.images,
          duration_ms: track.duration_ms,
          artists: track.artists.map(({ id, name }) => {
            return { id, name };
          }),
        };
      });
    else trackResponse = [];

    for (let i = 0; i < trackResponse.length; ++i) {
      this.cacheManager.set(`track_${trackResponse[i].id}`, trackResponse[i]);
    }

    responseArray = [...responseArray, ...trackResponse];

    responseArray.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));

    return responseArray;
  }

  async getExploreTrack(genreName: string): Promise<Track[]> {
    let playlistId: string;
    switch (genreName) {
      case 'NhacViet':
        playlistId = '37i9dQZF1DX4g8Gs5nUhpp';
        break;

      case 'Pop':
        playlistId = '37i9dQZF1EQncLwOalG3K7';
        break;

      case 'KPop':
        playlistId = '37i9dQZF1DX9tPFwDMOaN1';
        break;
      case 'HipHop':
        playlistId = '37i9dQZF1EQnqst5TRi17F';
        break;

      case 'NewMusic':
        playlistId = '37i9dQZF1DXbpmT3HUTsZm';
        break;

      case 'Top':
        playlistId = '37i9dQZEVXbLdGSmz6xilI';
        break;

      case 'Classic':
        playlistId = '37i9dQZF1EQn1VBR3CMMWb';
        break;

      case 'Blues':
        playlistId = '37i9dQZF1EQpz3DZCEoX3g';
        break;

      case 'InstrumentalMusic':
        playlistId = '37i9dQZF1EIeGNeZ9SQQlJ';
        break;

      case 'Anime':
        playlistId = '37i9dQZF1DX6XceWZP1znY';
        break;

      case 'JPop':
        playlistId = '37i9dQZF1DXdbRLJPSmnyq';
        break;

      case 'Funk':
        playlistId = '37i9dQZF1EQnJyHBkXpASl';
        break;

      case 'Gaming':
        playlistId = '37i9dQZF1DWTyiBJ6yEqeu';
        break;

      case 'Indie':
        playlistId = '37i9dQZF1EQqkOPvHGajmW';
        break;

      case 'R&B':
        playlistId = '37i9dQZF1EQoqCH7BwIYb7';
        break;

      case 'Rock':
        playlistId = '37i9dQZF1EQpj7X7UK8OOF';
        break;

      case 'Love':
        playlistId = '37i9dQZF1DWUYe7oajVI3W';
        break;

      default:
        return;
    }

    return await this.getPlaylistTracks(playlistId);
  }
}
