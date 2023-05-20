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
import { Track } from './entities/track.entity';

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
      throw new BadGatewayException();
    }
  }

  async getInfo(id: string): Promise<Track> {
    try {
      return await this.spotifyApiService.findOneTrackWithFormat(id);
    } catch (error) {
      if (error.body.error.status == 400) throw new BadRequestException();
      throw new BadGatewayException();
    }
  }

  async getTop50TracksVietnam(): Promise<Track[]> {
    const TOP50_PLAYLIST_ID = '37i9dQZEVXbLdGSmz6xilI';
    return await this.spotifyApiService.getTop50TracksVietnam(
      TOP50_PLAYLIST_ID,
    );
  }

  // TODO: implement mapping from flow explore playlist to spotify playlist
  async playPlaylist(genreName: string) {
    throw new Error('Method not implemented.');
  }
}
