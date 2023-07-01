import { Test, TestingModule } from '@nestjs/testing';
import { TracksController } from './tracks.controller';
import { SpotifyTrackRepository } from './tracks.service';

describe('TracksController', () => {
  let controller: TracksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TracksController],
      providers: [SpotifyTrackRepository],
    }).compile();

    controller = module.get<TracksController>(TracksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
