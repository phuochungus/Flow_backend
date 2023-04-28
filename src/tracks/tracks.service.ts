import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { iteratee } from 'lodash';
import { SpotifyApiService } from 'src/spotify-api/spotify-api.service';
import ytdl from 'ytdl-core';

@Injectable()
export class TracksService {
  constructor(
    private readonly spotifyApiService: SpotifyApiService,
    private readonly httpService: HttpService,
  ) {}

  async play(spotifyId: string, response: any) {
    const track = await this.spotifyApiService.findOne(spotifyId);
    const res = await this.httpService.axiosRef.get(
      'https://youtube.googleapis.com/youtube/v3/search',
      {
        params: {
          part: 'snippet',
          key: process.env.YOUTUBE_API_KEY,
          q:
            track.artists.map((e) => {
              return e.name;
            }) +
            ' ' +
            track.name +
            ' official',
        },
        headers: {
          Accept: 'application/json',
        },
      },
    );
    console.log(res.data.items);
    const youtubeId = res.data.items[0].id.videoId;
    const youtubeUrl = 'https://www.youtube.com/watch?v=' + youtubeId;
    try {
      const download = ytdl(youtubeUrl, { filter: 'audioonly' });
      download.pipe(response);
    } catch (error) {
      console.log(error);
    }
  }
}
