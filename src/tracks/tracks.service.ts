import {
  Injectable,
  BadGatewayException,
  BadRequestException,
} from '@nestjs/common';
import { SpotifyApiService } from 'src/spotify-api/spotify-api.service';
import youtubedl from 'youtube-dl-exec';
import { createReadStream } from 'fs';
import { Response } from 'express';
import { SpotifyToYoutubeService } from 'src/spotify-to-youtube/spotify-to-youtube.service';
import { join } from 'path';
import { Track } from './entities/track.entity';

@Injectable()
export class TracksService {
  constructor(
    private readonly spotifyApiService: SpotifyApiService,
    private readonly spotifyToYoutubeService: SpotifyToYoutubeService,
  ) {}

  async play(spotifyId: string, response: Response) {
    const track = await this.spotifyApiService.findOneTrack(spotifyId);
    const youtubeURL =
      await this.spotifyToYoutubeService.getYoutubeURLFromSpotify(track);
    try {
      await youtubedl(youtubeURL, {
        noCheckCertificates: true,
        noMtime: true,
        extractAudio: true,
        output: join(process.cwd(), 'audio', 'audio'),
      });

      const file = createReadStream(join(process.cwd(), 'audio', 'audio.opus'));
      response.setHeader('Content-Type', 'audio/ogg');
      response.setHeader('Transfer-Encoding', 'chunked');
      file.pipe(response);
    } catch (error) {
      throw new BadGatewayException();
    }
  }

  async getInfo(id: string): Promise<Track> {
    try {
      return await this.spotifyApiService.findOneTrackWithFormat(id);
    } catch (error) {
      if (error.body.error.status == 400) throw new BadRequestException();
      throw new BadGatewayException();
    }
  }

  async getTop50TracksVietnam(): Promise<Track[]> {
    const TOP50_PLAYLIST_ID = '37i9dQZEVXbLdGSmz6xilI';
    return await this.spotifyApiService.getPlaylistTracks(TOP50_PLAYLIST_ID);
  }

  async getExploreTrack(genreName: string) {
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

    return await this.spotifyApiService.getPlaylistTracks(playlistId);
  }
}
