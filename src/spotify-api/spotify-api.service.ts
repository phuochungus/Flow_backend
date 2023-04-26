import { Injectable } from '@nestjs/common';
import SpotifyWebApi from 'spotify-web-api-node';
import QueryTrackDTO from 'src/tracks/dto/query-track.dto';
import levenshtein from 'fast-levenshtein';
import { extend } from 'lodash';
import FuzzyMatching from 'fuzzy-matching';

import e from 'express';
import distance from 'jaro-winkler';

@Injectable()
export class SpotifyApiService {
  constructor() {
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

  async searchInSpotify(queryTrackDto: QueryTrackDTO): Promise<any> {
    try {
      const res = await this.spotifyWebApi.search(
        queryTrackDto.searchString,
        ['track', 'album', 'artist'],
        { market: 'VN' },
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
        queryTrackDto.searchString,
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
    let array = mostRelevantResults.map((e) => {
      return e.name;
    });
    for (let index in mostRelevantResults) {
      extend(mostRelevantResults[index], {
        score: distance(searchString, mostRelevantResults[index].name),
      });
    }
  }
}
