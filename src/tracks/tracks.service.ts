import { Injectable, OnModuleInit } from '@nestjs/common';
import { SpotifyApiService } from 'src/spotify-api/spotify-api.service';
import { MusicClient, MusicSongCompact } from 'youtubei';
import { intersection, isEqual } from 'lodash';
import youtubedl from 'youtube-dl-exec';
import ffmpeg from 'fluent-ffmpeg';
import { createReadStream } from 'fs';
import ffmpegPath from '@ffmpeg-installer/ffmpeg';
import { join } from 'path';
import { existsSync } from 'fs';

ffmpeg.setFfmpegPath(ffmpegPath.path);

@Injectable()
export class TracksService implements OnModuleInit {
  constructor(private readonly spotifyApiService: SpotifyApiService) {}
  
  onModuleInit() {
    if (existsSync(join(process.cwd(), 'binaries', 'ffmpeg.exe'))) {
      console.log('exist');
    } else {
      console.log('not exist');
    }
  }

  private readonly music = new MusicClient();

  async play(spotifyId: string, response: any) {
    const track = await this.spotifyApiService.findOne(spotifyId);
    let youtubeId: string;
    const shelves = await this.music.search(track.name);
    const requiredArtists = track.artists
      .map((e) => {
        return e.name;
      })
      .sort();
    for (let compact of shelves) {
      if (compact.title == 'Songs') {
        for (let index in compact.items) {
          let song = compact.items[index] as MusicSongCompact;
          const artists = song.artists
            .map((e) => {
              return e.name;
            })
            .sort();
          if (
            isEqual(artists, requiredArtists) ||
            intersection(artists, requiredArtists)
          ) {
            youtubeId = song.id;
            break;
          }
        }
      }
    }

    const youtubeUrl = 'https://www.youtube.com/watch?v=' + youtubeId;

    try {
      // console.log(join(process.cwd(), 'binaries', 'ffmpeg.exe'));
      await youtubedl(youtubeUrl, {
        // ffmpegLocation: join(process.cwd(), 'binaries', 'ffmpeg.exe'),
        noCheckCertificates: true,
        noMtime: true,
        extractAudio: true,
        output: 'audio.webm',
      });
      const file = createReadStream('audio.opus');
      file.pipe(response);
    } catch (error) {
      console.log(error);
    }
  }
}
