import { HttpException, Inject, Injectable } from '@nestjs/common';
import { SimplifiedArtistWithImages } from './entities/simplified-artist-with-images.entity';
import { Artist } from './entities/artist.entity';
import { EntityType } from '../albums/schemas/album.schema';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import _ from 'lodash';
import { SpotifyToYoutubeService } from '../spotify-to-youtube/spotify-to-youtube.service';
import { TrackSimplifyWithViewCount } from '../tracks/entities/track-simplify-with-view-count.entity';
import { YoutubeApiService } from '../youtube-api/youtube-api.service';
import { SpotifyApiService } from '../spotify-api/spotify-api.service';
import { Track } from '../tracks/entities/track.entity';

export abstract class ArtistRepository {
  abstract findOne(id: string): Promise<Artist>;
  abstract findManyRaw(ids: string[]): Promise<SpotifyApi.ArtistObjectFull[]>;
  abstract findPlaylistArtistsRaw(
    id: string,
  ): Promise<SpotifyApi.ArtistObjectFull[]>;
  abstract findTopArtists(): Promise<SimplifiedArtistWithImages[]>;
}
@Injectable()
export class SpotifyArtistRepository implements ArtistRepository {
  constructor(
    private readonly spotifyApiService: SpotifyApiService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly spotifyToYoutubeService: SpotifyToYoutubeService,
    private readonly youtubeApiService: YoutubeApiService,
  ) {}

  async findManyRaw(ids: string[]): Promise<SpotifyApi.ArtistObjectFull[]> {
    let queryIds = [];
    let responseArray = [];
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      const cacheResult = await this.cacheManager.get(`artist_${id}`);
      if (cacheResult)
        responseArray.push(cacheResult as SpotifyApi.ArtistObjectFull);
      else queryIds.push(id);
    }

    let trackResponse;
    if (queryIds.length > 0)
      trackResponse = (
        await this.spotifyApiService.spotifyWebApi.getArtists(queryIds)
      ).body.artists;
    else trackResponse = [];

    for (let i = 0; i < trackResponse.length; ++i) {
      this.cacheManager.set(`artist_${trackResponse[i].id}`, trackResponse[i]);
    }

    responseArray = [...responseArray, ...trackResponse];

    responseArray.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));

    return responseArray;
  }

  async findOne(artistId: string): Promise<Artist> {
    const cachedResult = await this.cacheManager.get(`artist_${artistId}`);
    if (cachedResult) {
      if (cachedResult != 'null') return cachedResult as Artist;
      return null;
    }

    try {
      const [albums, artistInfo, relatedArtists, topTracks] = await Promise.all(
        [
          this.spotifyApiService.spotifyWebApi
            .getArtistAlbums(artistId)
            .then((response) => response.body.items),
          this.spotifyApiService.spotifyWebApi
            .getArtist(artistId)
            .then((response) => response.body)
            .then(
              (artist) =>
                new Promise<any>((resolve, reject) =>
                  fetch(
                    `https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${artist.name}&api_key=${process.env.LASTFM_API_KEY}&format=json`,
                  )
                    .then((response) => response.json())
                    .then((response) =>
                      resolve({
                        ...artist,
                        bio: {
                          summary: response.artist.bio.summary,
                          content: response.artist.bio.content,
                        },
                      }),
                    )
                    .catch((error) => reject(error)),
                ),
            ),
          this.spotifyApiService.spotifyWebApi
            .getArtistRelatedArtists(artistId)
            .then((response) => response.body.artists),
          this.spotifyApiService.spotifyWebApi
            .getArtistTopTracks(artistId, 'VN')
            .then((response) => response.body.tracks)
            .then((tracks) => _.take(tracks, 5))
            .then((tracks) =>
              tracks.map(
                (trackInfo) =>
                  new Promise<TrackSimplifyWithViewCount>((resolve, reject) => {
                    (async () => {
                      try {
                        const youtubeId =
                          await this.spotifyToYoutubeService.convertSpotifyIdToYoutubeId(
                            trackInfo.id,
                          );
                        const viewCount =
                          await this.youtubeApiService.getViewCount(youtubeId);
                        const track: Track = {
                          id: trackInfo.id,
                          name: trackInfo.name,
                          type: EntityType.track,
                          duration_ms: trackInfo.duration_ms,
                          images: trackInfo.album.images,
                          artists: trackInfo.artists.map((artist) => {
                            return { id: artist.id, name: artist.name };
                          }),
                        };
                        this.cacheManager.set(`track_${trackInfo.id}`, track);
                        return resolve({
                          id: trackInfo.id,
                          name: trackInfo.name,
                          artists: trackInfo.artists.map((artist) => {
                            return { id: artist.id, name: artist.name };
                          }),
                          images: trackInfo.album.images,
                          viewCount,
                        });
                      } catch (error) {
                        console.error(error);
                        return reject(error);
                      }
                    })();
                  }),
              ),
            ),
        ],
      );

      const artistMetaData: Artist = {
        id: artistInfo.id,
        type: EntityType.artist,
        name: artistInfo.name,
        images: artistInfo.images,
        topTracks: await Promise.all(topTracks),
        albums: albums.map((e) => {
          return {
            id: e.id,
            type: EntityType.album,
            artists: e.artists.map((artist) => {
              return { id: artist.id, name: artist.name };
            }),
            images: e.images,
            name: e.name,
          };
        }),
        relatedArtists: relatedArtists.map((e) => {
          return {
            id: e.id,
            name: e.name,
            images: e.images,
            type: EntityType.artist,
          };
        }),
        bio: artistInfo.bio,
      };
      this.cacheManager.set(`artist_${artistId}`, artistMetaData);
      return artistMetaData;
    } catch (error) {
      if (error.body.error.status >= 400) {
        this.cacheManager.set(`artist_${artistId}`, 'null');
        return null;
      }
      if (!(error instanceof HttpException)) console.error(error);
      throw error;
    }
  }

  async findTopArtists(): Promise<SimplifiedArtistWithImages[]> {
    const PLAYLIST_ID = '37i9dQZEVXbLdGSmz6xilI';
    const artists = await this.findPlaylistArtistsRaw(PLAYLIST_ID);
    return artists.map((e) => {
      return {
        id: e.id,
        type: EntityType.artist,
        name: e.name,
        images: e.images,
      };
    });
  }

  async findPlaylistArtistsRaw(
    id: string,
  ): Promise<SpotifyApi.ArtistObjectFull[]> {
    const cacheResult = await this.cacheManager.get(`playlistArtists_${id}`);
    if (cacheResult) return cacheResult as SpotifyApi.ArtistObjectFull[];

    const tracks = (
      await this.spotifyApiService.spotifyWebApi.getPlaylistTracks(id, {
        limit: 20,
      })
    ).body;
    const artistIds = new Set<string>();

    tracks.items.forEach((e) => {
      e.track?.artists.forEach((artist) => artistIds.add(artist.id));
    });
    let artists = await this.spotifyApiService.spotifyWebApi.getArtists(
      Array.from(artistIds),
    );
    this.cacheManager.set(`playlistArtists_${id}`, artists.body.artists);
    return artists.body.artists;
  }
}
