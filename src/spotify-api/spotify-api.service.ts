import { Injectable } from '@nestjs/common';
import SpotifyWebApi from 'spotify-web-api-node';
import _ from 'lodash';
import { APIWrapper } from '../abstract/abstract';

@Injectable()
export class SpotifyApiService implements APIWrapper {
  constructor(public spotifyWebApi: SpotifyWebApi) {
    this.authorize();
    setInterval(this.authorize, 3300000);
  }

  async authorize() {
    this.spotifyWebApi.clientCredentialsGrant().then((data: any) => {
      this.spotifyWebApi.setAccessToken(data.body.access_token);
    });
  }
}
