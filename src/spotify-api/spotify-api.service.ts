import { Injectable } from '@nestjs/common';
import SpotifyWebApi from 'spotify-web-api-node';
import _ from 'lodash';

@Injectable()
export class SpotifyApiService {
  constructor(public spotifyWebApi: SpotifyWebApi) {
    this.authorize(spotifyWebApi);
    setInterval(() => this.authorize(spotifyWebApi), 3300000);
  }

  async authorize(spotifyApiInstance: any) {
    spotifyApiInstance.clientCredentialsGrant().then((data: any) => {
      spotifyApiInstance.setAccessToken(data.body.access_token);
    });
  }
}
