import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

@Injectable()
export class YoutubeApiService {
  constructor(private readonly httpService: HttpService) {}

  private API_KEY = process.env.YOUTUBE_API_KEY;

  async getViewCount(youtubeId: string): Promise<number> {
    const { data } = await this.httpService.axiosRef.get(
      'https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&id=' +
        youtubeId +
        '&key=' +
        this.API_KEY,
    );
    return parseInt(data.items[0].statistics.viewCount);
  }

  async getDurationInISO8601(youtubeId: string): Promise<string> {
    const { data } = await this.httpService.axiosRef.get(
      'https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&id=' +
        youtubeId +
        '&key=' +
        this.API_KEY,
    );
    return data.items[0].contentDetails.duration;
  }
}
