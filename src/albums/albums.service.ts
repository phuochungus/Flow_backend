import { Injectable } from '@nestjs/common';
import { SpotifyApiService } from 'src/spotify-api/spotify-api.service';

@Injectable()
export class AlbumsService {
  constructor(private readonly spotifyApiService: SpotifyApiService) {}
  async findOne(id: string) {
    return await this.spotifyApiService.findOneAlbumWithFormat(id);
  }
}
