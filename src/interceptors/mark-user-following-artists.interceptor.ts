import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map } from 'rxjs';

@Injectable()
export class MarkUserFollowingArtists implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    let req = context.switchToHttp().getRequest();
    const followingArtistIds: string[] = req.user.followingArtists;
    return next
      .handle()
      .pipe(map((data) => this.markFavouriteProduct(followingArtistIds, data)));
  }

  private markFavouriteProduct(followingArtistIds: string[], data: any) {
    if (data.id) {
      if (followingArtistIds.includes(data.id)) data.isFavourite = true;
      else data.isFavourite = false;
    }
    return data;
  }
}
