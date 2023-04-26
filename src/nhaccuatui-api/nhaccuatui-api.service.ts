import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import distance from 'jaro-winkler';
import { difference } from 'lodash';
import arc4 from 'arc4';

@Injectable()
export class NhaccuatuiApiService {
  constructor(private httpService: HttpService) {}

  async getSongByNameAndArtist(
    name: string,
    artist: string[],
  ): Promise<{ id: string }> {
    let res = await this.httpService.axiosRef.get(
      process.env.NhacCuaTui_ENDPOINT + '/search',
      {
        params: {
          keyword: name,
        },
      },
    );
    const songs = res.data.search.song.song.map((e) => {
      return {
        id: e.key,
        name: e.title,
        artists: e.artists.map((e) => {
          return e.name;
        }),
      };
    });

    for (let index in songs) {
      if (distance(name, songs[index].name) >= 0.8) {
        if (difference(songs[index], artist, artist).length == 0) {
          return { id: songs[index].id };
        }
      }
    }

    return { id: null };
  }

  async getSong(id: string): Promise<{ streamUrl: string }> {
    const res = await this.httpService.axiosRef.get(
      process.env.NhacCuaTui_ENDPOINT + '/song',
      {
        params: { key: id },
      },
    );
    return { streamUrl: res.data.song.streamUrls[0].streamUrl };
  }

  async getLyric(id: string): Promise<{ lyric: string }> {
    let res = await this.httpService.axiosRef.get(
      process.env.NhacCuaTui_ENDPOINT + '/lyric',
      {
        params: { key: id },
      },
    );

    let file = await this.httpService.axiosRef.get(res.data.lyric.originalUrl);
    let cipher = arc4('arc4', process.env.SECRET_DECRYPT);

    let decode = cipher.decodeString(file.data, 'hex', 'ascii');
    return { lyric: decode };
  }
}
