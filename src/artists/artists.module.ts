import { Module } from '@nestjs/common';
import { ArtistsService } from './artists.service';
import { ArtistsController } from './artists.controller';
import { SpotifyApiModule } from 'src/spotify-api/spotify-api.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [SpotifyApiModule, HttpModule],
  controllers: [ArtistsController],
  providers: [ArtistsService],
})
export class ArtistsModule {}
