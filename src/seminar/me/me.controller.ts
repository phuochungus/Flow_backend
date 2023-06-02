import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import JWTAuthGuard from 'src/auth/guards/jwt.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';

@ApiTags('me')
@Controller('me')
@UseGuards(JWTAuthGuard)
export class MeController {
  @Get('/profile')
  getProfile(@CurrentUser() user: any) {
    return user;
  }
}
