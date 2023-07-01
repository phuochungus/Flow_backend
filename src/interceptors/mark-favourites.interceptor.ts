import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map } from 'rxjs';

@Injectable()
export class MarkUserFavouritesInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    let req = context.switchToHttp().getRequest();
    const favouriteIds: string[] = req.user.favourites;
    return next
      .handle()
      .pipe(map((data) => this.markFavourites(favouriteIds, data)));
  }

  private markFavourites(favouriteIds: string[], data: any) {
    if (data.id) {
      if (favouriteIds.includes(data.id)) data.isFavourite = true;
      else data.isFavourite = false;
    }
    return data;
  }
}
