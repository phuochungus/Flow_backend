import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import SpotifyWebApi from 'spotify-web-api-node';
import { YoutubeApiService } from 'src/youtube-api/youtube-api.service';
import { SpotifyToYoutubeService } from 'src/spotify-to-youtube/spotify-to-youtube.service';
import Fuse from 'fuse.js';
import { HttpService } from '@nestjs/axios';
import { Track } from 'src/tracks/entities/track.entity';
import { Lyrics } from 'src/tracks/entities/lyrics.entity';
import { Artist } from 'src/artists/entities/artist.entity';
import { SearchResult } from 'src/search/dto/search-track.dto';
import { SimplifiedAlbumWithPopularity } from 'src/albums/entities/simplified-album-for-search.dto';
import { SimplifedTrackWithPopularity } from 'src/tracks/entities/simplify-track-for-search.dto';
import { SimplifiedArtistWithPopulary } from 'src/artists/entities/simplified-artist-for-search.entity';
import { EntityType, Album, AlbumType } from '../albums/schemas/album.schema';
import { TrackSimplifyWithViewCount } from '../tracks/entities/track-simplify-with-view-count.entity';
import _ from 'lodash';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

export type SimplifiedEntity =
  | SimplifedTrackWithPopularity
  | SimplifiedAlbumWithPopularity
  | SimplifiedArtistWithPopulary;

@Injectable()
export class SpotifyApiService {
  constructor(
    private readonly httpService: HttpService,
    private readonly youtubeApiService: YoutubeApiService,
    private readonly spotifyToYoutubeService: SpotifyToYoutubeService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {
    this.requestAccessToken();
    setInterval(this.requestAccessToken, 3300000);
  }

  public spotifyWebApi: SpotifyWebApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  });

  async requestAccessToken() {
    this.spotifyWebApi.clientCredentialsGrant().then((data: any) => {
      // console.log(data.body.access_token);
      this.spotifyWebApi.setAccessToken(data.body.access_token);
    });
  }

  async getAlbums(ids: string[]): Promise<SpotifyApi.AlbumObjectFull[]> {
    let queryIds = [];
    let responseArray = [];
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      const cacheResult = await this.cacheManager.get(`album_${id}`);
      if (cacheResult)
        responseArray.push(cacheResult as SpotifyApi.AlbumObjectFull);
      else queryIds.push(id);
    }

    let trackResponse;
    if (queryIds.length > 0)
      trackResponse = (await this.spotifyWebApi.getAlbums(queryIds)).body
        .albums;
    else trackResponse = [];

    for (let i = 0; i < trackResponse.length; ++i) {
      this.cacheManager.set(`album_${trackResponse[i].id}`, trackResponse[i]);
    }

    responseArray = [...responseArray, ...trackResponse];

    responseArray.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));

    return responseArray;
  }

  async getArtists(ids: string[]): Promise<SpotifyApi.ArtistObjectFull[]> {
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
      trackResponse = (await this.spotifyWebApi.getArtists(queryIds)).body
        .artists;
    else trackResponse = [];

    for (let i = 0; i < trackResponse.length; ++i) {
      this.cacheManager.set(`artist_${trackResponse[i].id}`, trackResponse[i]);
    }

    responseArray = [...responseArray, ...trackResponse];

    responseArray.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));

    return responseArray;
  }

  async getTracks(ids: string[]): Promise<SpotifyApi.TrackObjectFull[]> {
    let queryIds = [];
    let responseArray: SpotifyApi.TrackObjectFull[] = [];
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      const cacheResult = await this.cacheManager.get(`track_${id}`);
      if (cacheResult)
        responseArray.push(cacheResult as SpotifyApi.TrackObjectFull);
      else queryIds.push(id);
    }

    let trackResponse;
    if (queryIds.length > 0)
      trackResponse = (await this.spotifyWebApi.getTracks(queryIds)).body
        .tracks;
    else trackResponse = [];

    for (let i = 0; i < trackResponse.length; ++i) {
      this.cacheManager.set(`track_${trackResponse[i].id}`, trackResponse[i]);
    }

    responseArray = [...responseArray, ...trackResponse];

    responseArray.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));

    return responseArray;
  }

  async searchInSpotify(
    queryString: string,
    page: number = 0,
  ): Promise<SearchResult> {
    const cachedResult = await this.cacheManager.get(
      `search_page_${page}_query_${queryString}`,
    );

    if (cachedResult) {
      return cachedResult as SearchResult;
    }

    const res = (
      await this.spotifyWebApi.search(
        queryString,
        ['track', 'album', 'artist'],
        { market: 'VN', limit: 15, offset: page * 15 },
      )
    ).body;

    let albumWithoutPopularity;
    if (res.albums) {
      albumWithoutPopularity = (
        await this.spotifyWebApi.getAlbums(res.albums.items.map(({ id }) => id))
      ).body;
    } else {
      albumWithoutPopularity = [];
    }

    let albums: SimplifiedAlbumWithPopularity[] =
      albumWithoutPopularity.albums.map((e) => {
        return {
          id: e.id,
          type: EntityType.album,
          popularity: e.popularity,
          name: e.name,
          artists: e.artists.map((e) => {
            return { name: e.name, id: e.id };
          }),
          images: e.images,
        };
      });

    let tracks: SimplifedTrackWithPopularity[];
    if (res.tracks) {
      tracks = res.tracks.items.map((e) => {
        return {
          id: e.id,
          type: EntityType.track,
          name: e.name,
          images: e.album.images,
          artists: e.artists.map((e) => {
            return { name: e.name, id: e.id };
          }),
          popularity: e.popularity,
        };
      });
    } else {
      tracks = [];
    }

    let artists: SimplifiedArtistWithPopulary[];
    if (res.artists) {
      artists = res.artists.items.map((e) => {
        return {
          id: e.id,
          type: EntityType.artist,
          name: e.name,
          images: e.images,
          popularity: e.popularity,
        };
      });
    } else {
      artists = [];
    }

    artists = artists.filter((e) => e.images.length != 0);
    artists = artists.filter((e) => e.popularity != 0);
    let mostRelevantResults: SimplifiedEntity[] = [
      ...tracks,
      ...artists,
      ...albums,
    ];

    const mostRelevant = this.calculateScore(mostRelevantResults, queryString);

    this.cacheManager.set(`search_page_${page}_query_${queryString}`, {
      mostRelevant,
      albums,
      tracks,
      artists,
    });

    return {
      mostRelevant,
      albums,
      tracks,
      artists,
    };
  }

  private calculateScore(
    mostRelevantResults: SimplifiedEntity[],
    searchString: string,
  ): SimplifiedEntity[] {
    const fuse = new Fuse(mostRelevantResults, {
      keys: ['name'],
      includeScore: true,
    });

    let result = fuse.search(searchString);
    result.sort((n1, n2) => {
      if (n1.score && n2.score) {
        const tmp = n1.score - n2.score;
        if (tmp != 0) return tmp;
      }
      return n2.item.popularity - n1.item.popularity;
    });
    const originArray = result.map((e) => {
      return e.item;
    });
    return originArray;
  }

  async findOneTrack(id: string): Promise<SpotifyApi.SingleTrackResponse> {
    const cachedResult = await this.cacheManager.get(`track_${id}`);
    if (cachedResult) return cachedResult as SpotifyApi.SingleTrackResponse;
    try {
      const track = (await this.spotifyWebApi.getTrack(id)).body;
      this.cacheManager.set(`track_${id}`, track);
      return track;
    } catch (error) {
      console.error(error);
    }
  }

  async getLyric(spotifyId: string): Promise<Lyrics[] | null> {
    try {
      const cachedLyrics = await this.cacheManager.get(`lyrics_${spotifyId}`);
      if (cachedLyrics) {
        if (cachedLyrics != 'null') return cachedLyrics as Lyrics[];
        return null;
      }

      const res = await this.httpService.axiosRef.get(
        'https://spotify-lyric-api.herokuapp.com/?trackid=' + spotifyId,
      );
      const lyrics = res.data.lines.map(
        (e: { startTimeMs: string; words: string }) => {
          return { startTimeMs: parseInt(e.startTimeMs), words: e.words };
        },
      );

      this.cacheManager.set(`lyrics_${spotifyId}`, lyrics);
      return lyrics;
    } catch (error) {
      if (error.response.status == 404) {
        this.cacheManager.set(`lyrics_${spotifyId}`, 'null');
        return null;
      }
      console.error(error);
      throw error;
    }
  }

  async getPlaylistTracks(id: string): Promise<Track[]> {
    const cachedResult = await this.cacheManager.get(`playlist_${id}`);
    if (cachedResult) return cachedResult as Track[];

    let tracksResponse = (await this.spotifyWebApi.getPlaylistTracks(id)).body
      .items;
    tracksResponse = tracksResponse.filter((e) => e && e.track);
    const tracks = tracksResponse.map((e) => {
      return {
        id: e!.track!.id,
        name: e!.track!.name,
        type: EntityType.track,
        images: e!.track!.album.images,
        duration_ms: e!.track!.duration_ms,
        artists: e!.track!.artists.map((e) => {
          return { id: e.id, name: e.name };
        }),
      };
    });

    this.cacheManager.set(`playlist_${id}`, tracks);
    return tracks;
  }

  async findOneTrackWithFormat(id: string): Promise<Track> {
    const track = await this.findOneTrack(id);
    return {
      id: track.id,
      name: track.name,
      type: EntityType.track,
      duration_ms: track.duration_ms,
      images: track.album.images,
      artists: track.artists.map((e) => {
        return { id: e.id, name: e.name };
      }),
    };
  }

  async findArtistWithFormatV2(artistId: string): Promise<Artist | null> {
    const cachedResult = await this.cacheManager.get(`artist_${artistId}`);
    if (cachedResult) {
      if (cachedResult != 'null') return cachedResult as Artist;
      return null;
    }

    try {
      const [albums, artistInfo, relatedArtists, topTracks] = await Promise.all(
        [
          this.spotifyWebApi
            .getArtistAlbums(artistId)
            .then((response) => response.body.items),
          this.spotifyWebApi
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
          this.spotifyWebApi
            .getArtistRelatedArtists(artistId)
            .then((response) => response.body.artists),
          this.spotifyWebApi
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
                          await this.spotifyToYoutubeService.getYoutubeIdFromSpotifyTrack(
                            trackInfo,
                          );
                        const viewCount =
                          await this.youtubeApiService.getViewCount(youtubeId);
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
      console.error(error);
      throw error;
    }
  }

  async findArtistWithFormat(id: string): Promise<Artist> {
    let res;
    await Promise.all([
      this.spotifyWebApi.getArtistAlbums(id),
      this.spotifyWebApi.getArtist(id),
      this.spotifyWebApi.getArtistRelatedArtists(id),
      this.spotifyWebApi.getArtistTopTracks(id, 'VN'),
    ]).then(async (value) => {
      let topTracksPromises = value[3].body.tracks.map(async (e) => {
        return {
          id: e.id,
          name: e.name,
          images: e.album.images,
          viewCount: await this.youtubeApiService.getViewCount(
            await this.spotifyToYoutubeService.getYoutubeIdFromSpotifyTrack(e),
          ),
        };
      });

      let topTracks;
      await Promise.all(topTracksPromises).then((value) => {
        topTracks = value;
      });
      res = {
        id: value[1].body.id,
        type: EntityType.artist,
        name: value[1].body.name,
        images: value[1].body.images,
        topTracks,
        albums: value[0].body.items.map((e) => {
          return {
            id: e.id,
            name: e.name,
            images: e.images,
          };
        }),
        relatedArtists: value[2].body.artists.map((e) => {
          return {
            id: e.id,
            name: e.name,
            images: e.images,
          };
        }),
      };
    });
    return res;
  }

  async findOneAlbumWithFormat(id: string): Promise<Album> {
    const cacheResult = await this.cacheManager.get(`album_${id}`);
    if (cacheResult) return cacheResult as Album;
    const albumRes = (await this.spotifyWebApi.getAlbum(id)).body;
    const album = {
      id: albumRes.id,
      type: EntityType.album,
      album_type: AlbumType[albumRes.album_type.toString()],
      name: albumRes.name,
      images: albumRes.images,
      artists: albumRes.artists.map(({ id, name }) => {
        return { id, name };
      }),
      total_duration: albumRes.tracks.items.reduce((accumulate, current) => {
        return accumulate + current.duration_ms;
      }, 0),
      track: albumRes.tracks.items.map(({ id, name, duration_ms, artists }) => {
        return {
          id,
          name,
          type: EntityType.track,
          duration_ms,
          artists: artists.map(({ id, name }) => {
            return { id, name };
          }),
          images: albumRes.images,
        };
      }),
    };

    this.cacheManager.set(`album_${id}`, album);
    return album;
  }

  async getPlaylistArtists(id: string): Promise<SpotifyApi.ArtistObjectFull[]> {
    const cacheResult = await this.cacheManager.get(`playlistArtists_${id}`);
    if (cacheResult) return cacheResult as SpotifyApi.ArtistObjectFull[];

    const tracks = (
      await this.spotifyWebApi.getPlaylistTracks(id, { limit: 20 })
    ).body;
    const artistIds = new Set<string>();

    tracks.items.forEach((e) => {
      e.track?.artists.forEach((artist) => artistIds.add(artist.id));
    });
    let artists = await this.spotifyWebApi.getArtists(Array.from(artistIds));
    this.cacheManager.set(`playlistArtists_${id}`, artists.body.artists);
    return artists.body.artists;
  }
}
