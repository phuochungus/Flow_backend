import { Module } from '@nestjs/common';
import { NhaccuatuiApiService } from './nhaccuatui-api.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [NhaccuatuiApiService],
  exports: [NhaccuatuiApiService],
})
export class NhaccuatuiApiModule {}
