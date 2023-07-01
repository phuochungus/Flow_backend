import { Test, TestingModule } from '@nestjs/testing';
import { SpotifyAlbumRepository } from './albums.service';

describe('AlbumsService', () => {
  let service: SpotifyAlbumRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SpotifyAlbumRepository],
    }).compile();

    service = module.get<SpotifyAlbumRepository>(SpotifyAlbumRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
