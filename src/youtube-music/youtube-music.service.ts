import { Injectable, OnModuleInit } from '@nestjs/common';

export const ISearchMusicToken = Symbol('ISearchMusic');
export interface ISearchMusic {
  searchMusics(query: string): Promise<any[]>;
}

@Injectable()
export class YoutubeMusicService implements ISearchMusic, OnModuleInit {
  private youtubeMusicApi;
  async onModuleInit() {
    this.youtubeMusicApi = await import('node-youtube-music');
  }
  searchMusics(query: string): Promise<any[]> {
    return this.youtubeMusicApi.searchMusics(query);
  }
}
