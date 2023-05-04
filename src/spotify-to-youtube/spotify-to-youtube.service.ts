import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import YoutubeMusicApi from 'youtube-music-api';

@Injectable()
export class SpotifyToYoutubeService implements OnModuleInit {
  api = new YoutubeMusicApi();

  async onModuleInit() {
    await this.api.initalize();
  }

  async getYoutubeURLFromSpotify(
    spotifyTrack: SpotifyApi.SingleTrackResponse,
  ): Promise<string> {
    return `https://www.youtube.com/watch?v=${await this.getYoutubeIdFromSpotifyTrack(
      spotifyTrack,
    )}`;
  }

  async getYoutubeIdFromSpotifyTrack(
    spotifyTrack: SpotifyApi.SingleTrackResponse,
  ): Promise<string> {
    const searchResults = await this.api.search(spotifyTrack.name);
    if (searchResults.length == 0) throw new NotFoundException();

    return searchResults.content[0].videoId;
  }
}
