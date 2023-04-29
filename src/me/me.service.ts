import { Injectable } from '@nestjs/common';
import { TracksService } from 'src/tracks/tracks.service';

@Injectable()
export class MeService {
  constructor(private readonly tracksService: TracksService) {}

  async playTrack(user: any, id: string, response: any) {
    await this.tracksService.play(id, response);
    let array: string[] = user.recentPlayed;
    if (array.includes(id)) {
      user.recentPlayed = this.bubbleUp(array, id);
      user.save();
    } else if (array.length < 15) {
      user.recentPlayed.splice(0, 0, id);
      user.save();
    } else {
      user.recentPlayed.splice(0, 0, id);
      user.recentPlayed.pop();
      user.save();
    }
  }

  private bubbleUp(array: string[], id: string) {
    for (let index in array) {
      if (array[index] == id) {
        for (let iterator = parseInt(index); iterator >= 1; iterator--) {
          array[iterator] = array[iterator - 1];
        }
        array[0] = id;
      }
    }
    return array;
  }
}
