import { Injectable, OnModuleInit } from '@nestjs/common';
import SpotifyWebApi from 'spotify-web-api-node';
import _ from 'lodash';

@Injectable()
export class SpotifyApiService implements OnModuleInit {
  constructor(public readonly spotifyWebApi: SpotifyWebApi) {
    this.requestAccessToken();
  }

  onModuleInit() {
    setInterval(this.requestAccessToken, 3300000);
  }

  private async requestAccessToken() {
    this.spotifyWebApi.clientCredentialsGrant().then((data: any) => {
      this.spotifyWebApi.setAccessToken(data.body.access_token);
    });
  }
}
