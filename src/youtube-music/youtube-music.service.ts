import { Injectable, OnModuleInit } from '@nestjs/common';
export abstract class SearchMusicService {
  abstract searchMusicContent(query: string): Promise<any>;
}

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
