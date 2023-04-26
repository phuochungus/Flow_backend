import { Test, TestingModule } from '@nestjs/testing';
import { NhaccuatuiApiService } from './nhaccuatui-api.service';

describe('NhaccuatuiApiService', () => {
  let service: NhaccuatuiApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NhaccuatuiApiService],
    }).compile();

    service = module.get<NhaccuatuiApiService>(NhaccuatuiApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
