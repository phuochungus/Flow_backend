import { Injectable } from '@nestjs/common';
import { CreateArtistDto } from './dto/create-artist.dto';

@Injectable()
export class ArtistsService {
  create(createArtistDto: CreateArtistDto) {
    return 'This action adds a new artist';
  }
}
