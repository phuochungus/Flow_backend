import { Controller, Get, UseGuards, Request, Post } from '@nestjs/common';
import { FacebookAuthGuard } from './guards/facebook-oauth2.guard';
import { GoogleAuthGuard } from './guards/google-oauth2.guard';
import { AuthService } from './auth.service';
import LocalAuthGuard from './guards/local.guard';
import {
  ApiTags,
  ApiOAuth2,
  ApiBody,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { LocalLoginDTO } from './dto/local.dto';
import { AccessTokenDTO } from './dto/access-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('/google')
  @ApiTags('auth')
  @ApiOAuth2(['email', 'profile'], 'google')
  @UseGuards(GoogleAuthGuard)
  protected() {}

  @Get('/google-redirect')
  @ApiOAuth2(['email', 'profile'], 'google')
  @UseGuards(GoogleAuthGuard)
  async redirect(@Request() req: any): Promise<any> {
    return await this.authService.findOneOrCreate(req.user);
  }

  @Get('/facebook')
  @ApiTags('auth')
  @UseGuards(FacebookAuthGuard)
  protectedFB() {}

  @Get('/facebook-redirect')
  @UseGuards(FacebookAuthGuard)
  async redirectFacebook(@Request() req: any): Promise<any> {
    return await this.authService.findOneOrCreate(req.user);
  }

  @Post('/local')
  @UseGuards(LocalAuthGuard)
  @ApiTags('auth')
  @ApiBody({ type: LocalLoginDTO })
  @ApiCreatedResponse({ type: AccessTokenDTO })
  login(@Request() req: any) {
    return {
      accessToken: this.authService.generateAccessToken(req.user._id),
    };
  }
}
