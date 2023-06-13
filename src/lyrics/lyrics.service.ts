import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TrackLyrics } from './schemas/lyric.schema';
import { TracksService } from '../tracks/tracks.service';
import { SpotifyApiService } from '../spotify-api/spotify-api.service';

@Injectable()
export class LyricsService {
  constructor(
    @InjectModel(TrackLyrics.name)
    private trackLyricsModel: Model<TrackLyrics>,
    private spotifyApi: SpotifyApiService,
  ) {}

  async findOne(id: string) {
    const trackLyrics = await this.trackLyricsModel.findOne({ trackId: id });
    if (trackLyrics) return trackLyrics.lyrics;
    try {
      const lyrics = await this.spotifyApi.getLyricOrFail(id);
      const createdDocument = new this.trackLyricsModel({
        trackId: id,
        lyrics,
      });
      createdDocument.save();
      return lyrics;
    } catch (error) {
      throw error;
    }
  }
}
