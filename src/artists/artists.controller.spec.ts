import { Test, TestingModule } from '@nestjs/testing';
import { ArtistsController } from './artists.controller';
import { SpotifyArtistRepository } from './artists.service';

describe('ArtistsController', () => {
  let controller: ArtistsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArtistsController],
      providers: [SpotifyArtistRepository],
    }).compile();

    controller = module.get<ArtistsController>(ArtistsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
