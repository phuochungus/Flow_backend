import { Injectable } from '@nestjs/common';

@Injectable()
export class MeService {
  async playTrack(user: any, id: string) {
    user.playedItems.push({
      name: 'Đông Kiếm Em',
      spotifyId: '0B1ZnYwYefkNhZeE8ZQpv5',
      streamLink: 'nothing',
      playedAt: new Date(),
    });
    return await user.save();
  }
}
