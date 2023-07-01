import { Injectable, OnModuleInit } from '@nestjs/common';
import { SearchMusicService } from '../abstract/abstract';

@Injectable()
export class YoutubeMusicService implements SearchMusicService, OnModuleInit {
  private youtubeMusicApi;
  async onModuleInit() {
    this.youtubeMusicApi = await import('node-youtube-music');
  }

  searchMusicContent(query: string): Promise<any> {
    return this.youtubeMusicApi.searchMusics(query);
  }
}
