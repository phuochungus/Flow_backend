import { Injectable } from '@nestjs/common';
import SpotifyWebApi from 'spotify-web-api-node';
import { extend } from 'lodash';
import distance from 'jaro-winkler';
import { NhaccuatuiApiService } from 'src/nhaccuatui-api/nhaccuatui-api.service';
@Injectable()
export class SpotifyApiService {
  constructor(private readonly nhaccuatuiApiService: NhaccuatuiApiService) {
    this.requestAccessToken();
    setInterval(this.requestAccessToken, 3300000);
  }
  private spotifyWebApi: SpotifyWebApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
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
          name: e.name,
          id: e.id,
        };
      });

      let mostRelevantResults = [...tracks, ...artists, ...albums];
      this.calculateAndNormalizeLevenshteinDistance(
        mostRelevantResults,
        queryString,
      );

      mostRelevantResults.sort(
        (
          n1: {
            type: string;
            popularity: number;
            name: string;
            id: string;
            score?: number;
          },
          n2: {
            type: string;
            popularity: number;
            name: string;
            id: string;
            score?: number;
          },
        ) => {
          if (n1.score && n2.score) {
            const n1Score = (n1.popularity * 5) / 100 + 5 * n1.score;
            const n2Score = (n2.popularity * 5) / 100 + 5 * n2.score;
            if (n1Score < n2Score) return 1;
            else if (n1Score > n2Score) return -1;
            return 0;
          }
        },
      );

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

  calculateAndNormalizeLevenshteinDistance(
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

  async findOne(id: string): Promise<any> {
    try {
      const res = await this.spotifyWebApi.getTrack(id);
      const songName = res.body.name;
      const songArtists = res.body.artists.map((e) => {
        return e.name;
      });

      const res2 = await this.nhaccuatuiApiService.getSongByNameAndArtist(
        songName,
        songArtists,
      );
      const res3 = await this.nhaccuatuiApiService.getSong(res2.id);
      const res4 = await this.nhaccuatuiApiService.getLyric(res2.id);
      return {
        id,
        name: res.body.name,
        artists: res.body.artists.map((e) => {
          return { name: e.name, id: e.id };
        }),
        ...res3,
        ...res4,
      };
    } catch (error) {
      console.log(error);
    }
  }
}
