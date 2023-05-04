import {
  Injectable,
  BadGatewayException,
  BadRequestException,
} from '@nestjs/common';
import { SpotifyApiService } from 'src/spotify-api/spotify-api.service';
import youtubedl from 'youtube-dl-exec';
import { createReadStream } from 'fs';
import { Response } from 'express';
import { SpotifyToYoutubeService } from 'src/spotify-to-youtube/spotify-to-youtube.service';
import { join } from 'path';

@Injectable()
export class TracksService {
  constructor(
    private readonly spotifyApiService: SpotifyApiService,
    private readonly spotifyToYoutubeService: SpotifyToYoutubeService,
  ) {}

  async play(spotifyId: string, response: Response) {
    const track = await this.spotifyApiService.findOneTrack(spotifyId);
    const youtubeURL =
      await this.spotifyToYoutubeService.getYoutubeURLFromSpotify(track);
    try {
      await youtubedl(youtubeURL, {
        noCheckCertificates: true,
        noMtime: true,
        extractAudio: true,
        output: join(process.cwd(), 'audio', 'audio'),
      });

      const file = createReadStream(join(process.cwd(), 'audio', 'audio.opus'));
      response.setHeader('Content-Type', 'audio/ogg');
      file.pipe(response);
    } catch (error) {
      console.log(error);
      throw new BadGatewayException();
    }
  }

  async getInfo(id: string) {
    try {
      return await this.spotifyApiService.findOneTrackWithFormat(id);
    } catch (error) {
      if (error.body.error.status == 400) throw new BadRequestException();
      throw new BadGatewayException();
    }
  }
}
