import { Controller, Get, UseGuards, Request, Post } from '@nestjs/common';
import { FacebookAuthGuard } from './guards/facebook-oauth2.guard';
import { GoogleAuthGuard } from './guards/google-oauth2.guard';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import JWTAuthGuard from './guards/jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('verify')
  @UseGuards(JWTAuthGuard)
  pro(@Request() req) {
    return req.user;
  }

  @Get('/google')
  @UseGuards(GoogleAuthGuard)
  protected() {}

  @Get('/google-redirect')
  @UseGuards(GoogleAuthGuard)
  async redirect(@Request() req: any): Promise<any> {
    return await this.authService.findOneOrCreate(req.user);
  }

  @Get('/facebook')
  @UseGuards(FacebookAuthGuard)
  protectedFB() {}

  @Get('/facebook-redirect')
  @UseGuards(FacebookAuthGuard)
  async redirectFacebook(@Request() req: any): Promise<any> {
    return await this.authService.findOneOrCreate(req.user);
  }
}
