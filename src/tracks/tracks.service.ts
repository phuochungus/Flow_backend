import { Injectable, OnModuleInit } from '@nestjs/common';
import { SpotifyApiService } from 'src/spotify-api/spotify-api.service';
import youtubedl from 'youtube-dl-exec';
import { createReadStream } from 'fs';
import { Response } from 'express';
@Injectable()
export class TracksService implements OnModuleInit {
  constructor(private readonly spotifyApiService: SpotifyApiService) {}

  private searchMusics: (query: string) => Promise<any>;
  async onModuleInit() {
    this.searchMusics = (await import('node-youtube-music')).searchMusics;
  }

  async play(spotifyId: string, response: Response) {
    const track = await this.spotifyApiService.findOne(spotifyId);
    const result = await this.searchMusics(track.name);
    const youtubeId = result[0].youtubeId;

    const youtubeUrl = 'https://www.youtube.com/watch?v=' + youtubeId;
    try {
      await youtubedl(youtubeUrl, {
        noCheckCertificates: true,
        noMtime: true,
        extractAudio: true,
        output: 'audio',
      });
      const file = createReadStream('audio.opus');
      file.pipe(response);
    } catch (error) {
      console.log(error);
    }
  }
}
