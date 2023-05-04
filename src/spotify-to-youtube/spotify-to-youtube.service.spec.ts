import { Test, TestingModule } from '@nestjs/testing';
import { SpotifyToYoutubeService } from './spotify-to-youtube.service';

describe('SpotifyToYoutubeService', () => {
  let service: SpotifyToYoutubeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SpotifyToYoutubeService],
    }).compile();

    service = module.get<SpotifyToYoutubeService>(SpotifyToYoutubeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
