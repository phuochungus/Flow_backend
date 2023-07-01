import { Test, TestingModule } from '@nestjs/testing';
import { SpotifyArtistRepository } from './artists.service';

describe('ArtistsService', () => {
  let service: SpotifyArtistRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SpotifyArtistRepository],
    }).compile();

    service = module.get<SpotifyArtistRepository>(SpotifyArtistRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
