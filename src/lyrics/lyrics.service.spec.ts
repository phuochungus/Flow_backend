import { Test, TestingModule } from '@nestjs/testing';
import { MusixmatchLyricsRepository } from './lyrics.service';

describe('LyricsService', () => {
  let service: MusixmatchLyricsRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MusixmatchLyricsRepository],
    }).compile();

    service = module.get<MusixmatchLyricsRepository>(MusixmatchLyricsRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
