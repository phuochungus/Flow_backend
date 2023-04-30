import { Injectable } from '@nestjs/common';
import SpotifyWebApi from 'spotify-web-api-node';
import { extend } from 'lodash';
import distance from 'jaro-winkler';
import MusixMatch from 'musixmatch-richsync';
@Injectable()
export class SpotifyApiService {
  constructor() {
    this.requestAccessToken();
    setInterval(this.requestAccessToken, 3300000);
  }
  private spotifyWebApi: SpotifyWebApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  });

  private mm = new MusixMatch([
    process.env.MUSIXMATCH_API_KEY,
  ]);

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
          name: e.name,
          id: e.id,
        };
      });

      let mostRelevantResults: {
        type: string;
        popularity: number;
        name: string;
        id: string;
        score?: number;
      }[] = [...tracks, ...artists, ...albums];

      this.calculateScore(mostRelevantResults, queryString);

      mostRelevantResults.sort((n1, n2) => {
        if (n1.score && n2.score) {
          const n1Score = (n1.popularity * 5) / 100 + 5 * n1.score;
          const n2Score = (n2.popularity * 5) / 100 + 5 * n2.score;
          if (n1Score < n2Score) return 1;
          else if (n1Score > n2Score) return -1;
          return 0;
        }
        return 0;
      });

      return {
        mostRelevantResults,
        albums,
        tracks,
        artists,
      };
    } catch (error) {
      console.log(error);
    }
  }

  calculateScore(
    mostRelevantResults: {
      type: string;
      popularity: number;
      name: string;
      id: string;
    }[],
    searchString: string,
  ) {
    for (let index in mostRelevantResults) {
      extend(mostRelevantResults[index], {
        score: distance(searchString, mostRelevantResults[index].name),
      });
    }
  }

  async findOne(id: string): Promise<{
    id: string;
    name: string;
    type: string;
    images: SpotifyApi.ImageObject[];
    artists: { id: string; name: string }[];
  }> {
    const response = (await this.spotifyWebApi.getTrack(id)).body;
    return {
      id: response.id,
      name: response.name,
      type: 'track',
      images: response.album.images,
      artists: response.artists.map((e) => {
        return { id: e.id, name: e.name };
      }),
    };
  }

  async getLyric(id: string) {
    const ISRC = (await this.spotifyWebApi.getTrack(id)).body.external_ids.isrc;
    const body = (await this.mm.getRichsyncLyrics(ISRC)).richsync_body;

    return body.map((e) => {
      return { start: e.start, end: e.end, text: e.text };
    });
  }
}
