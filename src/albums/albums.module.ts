import { Module } from '@nestjs/common';
import { AlbumsService } from './albums.service';
import { AlbumsController } from './albums.controller';
import { SpotifyApiModule } from 'src/spotify-api/spotify-api.module';

@Module({
  imports: [SpotifyApiModule],
  controllers: [AlbumsController],
  providers: [AlbumsService],
})
export class AlbumsModule {}
