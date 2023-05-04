import { Injectable } from '@nestjs/common';
import SpotifyWebApi from 'spotify-web-api-node';
import { YoutubeApiService } from 'src/youtube-api/youtube-api.service';
import { SpotifyToYoutubeService } from 'src/spotify-to-youtube/spotify-to-youtube.service';
import Fuse from 'fuse.js';
import { HttpService } from '@nestjs/axios';

export type SearchItem = {
  type: string;
  popularity: number;
  name: string;
  id: string;
};
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

  private spotifyWebApi: SpotifyWebApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  });

  async requestAccessToken() {
    this.spotifyWebApi.clientCredentialsGrant().then((data: any) => {
      this.spotifyWebApi.setAccessToken(data.body.access_token);
    });
  }

  async searchInSpotify(queryString: string, page: number = 0): Promise<any> {
    try {
      const res = await this.spotifyWebApi.search(
        queryString,
        ['track', 'album', 'artist'],
        { market: 'VN', limit: 15, offset: page * 15 },
      );

      let albumRes = await this.spotifyWebApi.getAlbums(
        res.body.albums.items.map((e) => e.id),
      );
      let albums = albumRes.body.albums.map((e) => {
        return {
          type: 'album',
          popularity: e.popularity,
          name: e.name,
          id: e.id,
          artists: e.artists.map((e) => {
            return { name: e.name, id: e.id };
          }),
          images: e.images,
        };
      });

      let tracks = res.body.tracks.items.map((e) => {
        return {
          type: 'track',
          popularity: e.popularity,
          name: e.name,
          id: e.id,
          artists: e.artists.map((e) => {
            return { name: e.name, id: e.id };
          }),
          images: e.album.images,
        };
      });

      let artists = res.body.artists.items.map((e) => {
        return {
          type: 'artist',
          popularity: e.popularity,
          images: e.images,
          name: e.name,
          id: e.id,
        };
      });

      artists = artists.filter((e) => e.images.length != 0);
      artists = artists.filter((e) => e.popularity != 0);
      let mostRelevantResults: SearchItem[] = [
        ...tracks,
        ...artists,
        ...albums,
      ];

      const calculatedScoreArray = this.calculateScore(
        mostRelevantResults,
        queryString,
      );

      return {
        calculatedScoreArray,
        albums,
        tracks,
        artists,
      };
    } catch (error) {
      console.log(error);
    }
  }

  private calculateScore(
    mostRelevantResults: SearchItem[],
    searchString: string,
  ): SearchItem[] {
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
    console.log(originArray);
    return originArray;
  }

  async findOneTrack(id: string): Promise<SpotifyApi.SingleTrackResponse> {
    return (await this.spotifyWebApi.getTrack(id)).body;
  }

  async findOneTrackWithFormat(id: string): Promise<{
    id: string;
    name: string;
    type: string;
    duration_ms: number;
    images: SpotifyApi.ImageObject[];
    artists: { id: string; name: string }[];
  }> {
    const trackMetaInfo = (await this.spotifyWebApi.getTrack(id)).body;
    return {
      id: trackMetaInfo.id,
      name: trackMetaInfo.name,
      type: 'track',
      duration_ms: trackMetaInfo.duration_ms,
      images: trackMetaInfo.album.images,
      artists: trackMetaInfo.artists.map((e) => {
        return { id: e.id, name: e.name };
      }),
    };
  }

  async getLyric(spotifyId: string) {
    // const ISRC = (await this.spotifyWebApi.getTrack(id)).body.external_ids.isrc;
    // try {
    //   const body = (await this.mm.getRichsyncLyrics(ISRC)).richsync_body;
    //   return body.map((e) => {
    //     return { start: e.start, end: e.end, text: e.text };
    //   });
    // } catch (error) {
    //   throw new NotFoundException();
    // }
    const res = await this.httpService.axiosRef.get(
      'https://spotify-lyric-api.herokuapp.com/?trackid=' + spotifyId,
    );
    return res.data.lines.map((e) => {
      return { startTimeMs: e.startTimeMs, words: e.words };
    });
  }

  async getTop50TracksVietnam() {
    const PLAYLIST_ID = '37i9dQZEVXbLdGSmz6xilI';

    return (
      await this.spotifyWebApi.getPlaylistTracks(PLAYLIST_ID)
    ).body.items.map((e) => {
      return {
        id: e.track.id,
        name: e.track.name,
        images: e.track.album.images,
        duration_ms: e.track.duration_ms,
        artists: e.track.artists.map((e) => {
          return { id: e.id, name: e.name };
        }),
      };
    });
  }

  async findArtistWithFormat(id: string) {
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
        name: value[1].body.name,
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
