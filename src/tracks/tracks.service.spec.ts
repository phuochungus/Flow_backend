import { Test, TestingModule } from '@nestjs/testing';
import { SpotifyTrackRepository } from './tracks.service';

describe('TracksService', () => {
  let service: SpotifyTrackRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SpotifyTrackRepository],
    }).compile();

    service = module.get<SpotifyTrackRepository>(SpotifyTrackRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
