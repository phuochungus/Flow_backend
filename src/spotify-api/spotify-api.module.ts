import { Module } from '@nestjs/common';
import { SpotifyApiService } from './spotify-api.service';
import { NhaccuatuiApiModule } from 'src/nhaccuatui-api/nhaccuatui-api.module';

@Module({
  imports: [NhaccuatuiApiModule],
  providers: [SpotifyApiService],
  exports: [SpotifyApiService],
})
export class SpotifyApiModule {}
