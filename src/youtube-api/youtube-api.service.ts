import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

@Injectable()
export class YoutubeApiService {
  constructor(private readonly httpService: HttpService) {}

  private API_KEY = process.env.YOUTUBE_API_KEY;

  async getViewCount(youtubeId: string): Promise<number> {
    const trackStat = await this.httpService.axiosRef.get(
      'https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&id=' +
        youtubeId +
        '&key=' +
        this.API_KEY,
    );
    return parseInt(trackStat.data.items[0].statistics.viewCount);
  }
}
