import {
  Injectable,
  BadGatewayException,
  BadRequestException,
} from '@nestjs/common';
import { SpotifyApiService } from 'src/spotify-api/spotify-api.service';
import youtubedl from 'youtube-dl-exec';
import { createReadStream, createWriteStream, readFile } from 'fs';
import { Response } from 'express';
import { SpotifyToYoutubeService } from 'src/spotify-to-youtube/spotify-to-youtube.service';
import { join } from 'path';
import { Track } from './entities/track.entity';
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import ytdl from 'ytdl-core';

@Injectable()
export class TracksService {
  constructor(
    private readonly spotifyApiService: SpotifyApiService,
    private readonly spotifyToYoutubeService: SpotifyToYoutubeService,
  ) {}

  private supabase = createClient(
    process.env.SUPABASE_PROJECT_URL,
    process.env.SUPABASE_API_KEY,
  );

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
      response.setHeader('Transfer-Encoding', 'chunked');
      file.pipe(response);
    } catch (error) {
      throw new BadGatewayException();
    }
  }

  private async fileExistInBucket(filename: string): Promise<boolean> {
    const { data, error } = await this.supabase.storage.from('tracks').list();
    if (error) return false;

    for (let file of data) {
      if (file.name == filename) return true;
    }

    return false;
  }

  async playExperiment(spotifyId: string, response: Response) {
    // if (await this.fileExistInBucket(spotifyId)) {
    //   const { data, error } = await this.supabase.storage
    //     .from('tracks')
    //     .createSignedUrl(spotifyId, 600);
    //   if (error) console.log(error);
    //   response.redirect(data.signedUrl);
    // } else {
    const track = await this.spotifyApiService.findOneTrack(spotifyId);
    const youtubeURL =
      await this.spotifyToYoutubeService.getYoutubeURLFromSpotify(track);
    try {
      ytdl(youtubeURL, {
        requestOptions: {
          headers: {
            cookie:
              'VISITOR_INFO1_LIVE=6zzOTiFYgxY; __Secure-3PAPISID=DdpkvJGLZzmJxpDV/ALFEN8n4m-F3yzRih; __Secure-3PSID=XQjfA8dp_C0yGnimEGJuKNHodQ3vPXcExRkAtbvHO6a48LyC7lW6Df8deFH8i3OaXoxv0Q.; LOGIN_INFO=AFmmF2swRQIgQXWMPqA6z7vGvrTPDp24osIZY5T5JqHZ2T4yySCemekCIQCm3Pj2MIHe-N7Bal2XUMyOAK7QG_QU-MuQb4RP_gEfeQ:QUQ3MjNmd3o0eEd2U05Dbmh3U0dTMExhNXNMSlhBMm1FQkwxNVByYTMtQ2dXbEllVHI0S25sR3diNF90OWh5ckg3Vzk0VlRONmhFYjNWcHV0NlFOakNpMng0SUt5X2Z3bVBXZHJocmc0M3lfVk1SZEVBaEZTbGJHVlJwRVMzTFlGVU13enVHX3FaUElxOHpPSkpXc2dqd19aT1YySm9XUWJn; _gcl_au=1.1.1358410736.1686481284; PREF=tz=Asia.Bangkok&f4=4000000&f6=40000000&f7=100&autoplay=true; YSC=LlL_xTL3FXE; ST-plcuz1=; ST-1kv9oej=; ST-1b=disableCache=true&itct=CBUQsV4iEwjnxuv-2bz_AhV-r1YBHbYBDrQ%3D&csn=MC41MDExMTI0MDgwMjc1ODc1&endpoint=%7B%22clickTrackingParams%22%3A%22CBUQsV4iEwjnxuv-2bz_AhV-r1YBHbYBDrQ%3D%22%2C%22commandMetadata%22%3A%7B%22webCommandMetadata%22%3A%7B%22url%22%3A%22%2F%22%2C%22webPageType%22%3A%22WEB_PAGE_TYPE_BROWSE%22%2C%22rootVe%22%3A3854%2C%22apiUrl%22%3A%22%2Fyoutubei%2Fv1%2Fbrowse%22%7D%7D%2C%22browseEndpoint%22%3A%7B%22browseId%22%3A%22FEwhat_to_watch%22%7D%7D; __Secure-3PSIDCC=AP8dLtwubncXhJFoVyb20NmVMouACMbMwwCwXd8ditbP23k9dHqJtrsECqm0sHl4bVRM8cpyHA',
          },
        },
        filter: 'audioonly',
        quality: 'highestaudio',
      })
        .pipe(createWriteStream(join(process.cwd(), 'audio', 'audio.opus')))
        .on('finish', () => {
          fs.readFile(
            join(process.cwd(), 'audio', 'audio.opus'),
            (err, data) => {
              this.supabase.storage
                .from('tracks')
                .upload(spotifyId, data, { contentType: 'audio/ogg' });

              response.setHeader('Content-Type', 'audio/ogg');
              response.send(data);
            },
          );
        });
    } catch (error) {
      throw new BadGatewayException();
    }
    // }
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
    return await this.spotifyApiService.getPlaylistTracks(TOP50_PLAYLIST_ID);
  }

  async getExploreTrack(genreName: string) {
    let playlistId: string;
    switch (genreName) {
      case 'NhacViet':
        playlistId = '37i9dQZF1DX4g8Gs5nUhpp';
        break;

      case 'Pop':
        playlistId = '37i9dQZF1EQncLwOalG3K7';
        break;

      case 'KPop':
        playlistId = '37i9dQZF1DX9tPFwDMOaN1';
        break;
      case 'HipHop':
        playlistId = '37i9dQZF1EQnqst5TRi17F';
        break;

      case 'NewMusic':
        playlistId = '37i9dQZF1DXbpmT3HUTsZm';
        break;

      case 'Top':
        playlistId = '37i9dQZEVXbLdGSmz6xilI';
        break;

      case 'Classic':
        playlistId = '37i9dQZF1EQn1VBR3CMMWb';
        break;

      case 'Blues':
        playlistId = '37i9dQZF1EQpz3DZCEoX3g';
        break;

      case 'InstrumentalMusic':
        playlistId = '37i9dQZF1EIeGNeZ9SQQlJ';
        break;

      case 'Anime':
        playlistId = '37i9dQZF1DX6XceWZP1znY';
        break;

      case 'JPop':
        playlistId = '37i9dQZF1DXdbRLJPSmnyq';
        break;

      case 'Funk':
        playlistId = '37i9dQZF1EQnJyHBkXpASl';
        break;

      case 'Gaming':
        playlistId = '37i9dQZF1DWTyiBJ6yEqeu';
        break;

      case 'Indie':
        playlistId = '37i9dQZF1EQqkOPvHGajmW';
        break;

      case 'R&B':
        playlistId = '37i9dQZF1EQoqCH7BwIYb7';
        break;

      case 'Rock':
        playlistId = '37i9dQZF1EQpj7X7UK8OOF';
        break;

      case 'Love':
        playlistId = '37i9dQZF1DWUYe7oajVI3W';
        break;

      default:
        return;
    }

    return await this.spotifyApiService.getPlaylistTracks(playlistId);
  }
}
