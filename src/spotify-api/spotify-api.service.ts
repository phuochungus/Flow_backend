import { Injectable, NotFoundException } from '@nestjs/common';
import SpotifyWebApi from 'spotify-web-api-node';
import { YoutubeApiService } from 'src/youtube-api/youtube-api.service';
import { SpotifyToYoutubeService } from 'src/spotify-to-youtube/spotify-to-youtube.service';
import Fuse from 'fuse.js';
import { HttpService } from '@nestjs/axios';
import { Track } from 'src/tracks/entities/track.entity';
import { Lyrics } from 'src/tracks/entities/lyrics.entity';
import { Album, AlbumType, EntityType } from 'src/albums/entities/album.entity';
import { Artist } from 'src/artists/entities/artist.entity';
import { SearchResult } from 'src/search/dto/search-track.dto';
import { SimplifiedAlbumWithPopularity } from 'src/albums/entities/simplified-album-for-search.dto';
import { SimplifedTrackWithPopularity } from 'src/tracks/entities/simplify-track-for-search.dto';
import { SimplifiedArtistWithPopulary } from 'src/artists/entities/simplified-artist-for-search.entity';

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
      this.spotifyWebApi.setAccessToken(data.body.access_token);
    });
  }

  async searchInSpotify(
    queryString: string,
    page: number = 0,
  ): Promise<SearchResult> {
    const res = (
      await this.spotifyWebApi.search(
        queryString,
        ['track', 'album', 'artist'],
        { market: 'VN', limit: 15, offset: page * 15 },
      )
    ).body;

    let albumWithoutPopularity = (
      await this.spotifyWebApi.getAlbums(res.albums.items.map(({ id }) => id))
    ).body;

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

    let tracks: SimplifedTrackWithPopularity[] = res.tracks.items.map((e) => {
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

    let artists: SimplifiedArtistWithPopulary[] = res.artists.items.map((e) => {
      return {
        id: e.id,
        type: EntityType.artist,
        name: e.name,
        images: e.images,
        popularity: e.popularity,
      };
    });

    artists = artists.filter((e) => e.images.length != 0);
    artists = artists.filter((e) => e.popularity != 0);
    let mostRelevantResults: SimplifiedEntity[] = [
      ...tracks,
      ...artists,
      ...albums,
    ];

    const mostRelevant = this.calculateScore(mostRelevantResults, queryString);

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
      const tmp = n1.score - n2.score;
      if (tmp != 0) return tmp;
      return n2.item.popularity - n1.item.popularity;
    });
    const originArray = result.map((e) => {
      return e.item;
    });
    return originArray;
  }

  async findOneTrack(id: string): Promise<SpotifyApi.SingleTrackResponse> {
    return (await this.spotifyWebApi.getTrack(id)).body;
  }

  async getLyricOrFail(spotifyId: string): Promise<Lyrics[]> {
    try {
      const res = await this.httpService.axiosRef.get(
        'https://spotify-lyric-api.herokuapp.com/?trackid=' + spotifyId,
      );
      return res.data.lines.map((e: { startTimeMs: string; words: string }) => {
        return { startTimeMs: parseInt(e.startTimeMs), words: e.words };
      });
    } catch (error) {
      if (error.response.status == 404) throw new NotFoundException();
    }
  }

  async getPlaylistTracks(id: string): Promise<Track[]> {
    return (await this.spotifyWebApi.getPlaylistTracks(id)).body.items.map(
      (e) => {
        return {
          id: e.track.id,
          name: e.track.name,
          type: EntityType.track,
          images: e.track.album.images,
          duration_ms: e.track.duration_ms,
          artists: e.track.artists.map((e) => {
            return { id: e.id, name: e.name };
          }),
        };
      },
    );
  }

  async findOneTrackWithFormat(id: string): Promise<Track> {
    const track = (await this.spotifyWebApi.getTrack(id)).body;
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
    const album = (await this.spotifyWebApi.getAlbum(id)).body;
    return {
      id: album.id,
      type: EntityType.album,
      album_type: AlbumType[album.album_type.toString()],
      name: album.name,
      images: album.images,
      artists: album.artists.map(({ id, name }) => {
        return { id, name };
      }),
      total_duration: album.tracks.items.reduce((accumulate, current) => {
        return accumulate + current.duration_ms;
      }, 0),
      track: album.tracks.items.map(({ id, name, duration_ms, artists }) => {
        return {
          id,
          name,
          type: EntityType.track,
          duration_ms,
          artists: artists.map(({ id, name }) => {
            return { id, name };
          }),
          images: album.images,
        };
      }),
    };
  }

  async getAlbumArtists(id: string) {
    const tracks = (
      await this.spotifyWebApi.getPlaylistTracks(id, { limit: 20 })
    ).body;
    const artistIds = new Set<string>();

    tracks.items.forEach((e) => {
      e.track.artists.forEach((artist) => artistIds.add(artist.id));
    });
    let artists = await this.spotifyWebApi.getArtists(Array.from(artistIds));
    return artists.body.artists;
  }
}
