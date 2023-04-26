import { Injectable } from '@nestjs/common';
import { CreateTrackDto } from './dto/create-track.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Track } from './schemas/track.schema';
import QueryTrackDTO from './dto/query-track.dto';
import { SpotifyApiService } from 'src/spotify-api/spotify-api.service';

@Injectable()
export class TracksService {
  constructor(
    @InjectModel(Track.name) private trackModel: Model<Track>,
    private readonly spotifyApiService: SpotifyApiService,
  ) {}

  create(createTrackDto: CreateTrackDto) {}

  async findOneOrCreateIfNotExist(queryString: string) {
    return this.spotifyApiService.searchInSpotify(queryString);
  }
}
