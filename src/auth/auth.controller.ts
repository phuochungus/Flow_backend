import { Controller, Get, UseGuards, Request, Post } from '@nestjs/common';
import { FacebookAuthGuard } from './guards/facebook-oauth2.guard';
import { GoogleAuthGuard } from './guards/google-oauth2.guard';
import { AuthService } from './auth.service';
import LocalAuthGuard from './guards/local.guard';
import { ApiTags, ApiOAuth2, ApiBody, ApiCreatedResponse } from '@nestjs/swagger';
import { LocalLoginDTO } from './dto/local.dto';
import { AccessTokenDTO } from './dto/access-token.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // @Post('verify')
  // @UseGuards(JWTAuthGuard)
  // pro(@Request() req) {
  //   return req.user;
  // }

  @ApiOAuth2(['email', 'profile'])
  @Get('/google')
  @UseGuards(GoogleAuthGuard)
  protected() {}

  @Get('/google-redirect')
  @ApiOAuth2(['email', 'profile'])
  @UseGuards(GoogleAuthGuard)
  async redirect(@Request() req: any): Promise<any> {
    return await this.authService.findOneOrCreate(req.user);
  }

  @Get('/facebook')
  @ApiOAuth2(['public_profile', 'user_birthday', 'email'])
  @UseGuards(FacebookAuthGuard)
  protectedFB() {}

  @Get('/facebook-redirect')
  @ApiOAuth2(['public_profile', 'user_birthday', 'email'])
  @UseGuards(FacebookAuthGuard)
  async redirectFacebook(@Request() req: any): Promise<any> {
    return await this.authService.findOneOrCreate(req.user);
  }

  @ApiBody({ type: LocalLoginDTO })
  @ApiCreatedResponse({type: AccessTokenDTO})
  @Post('/local')
  @UseGuards(LocalAuthGuard)
  login(@Request() req: any) {
    return {
      accessToken: this.authService.generateAccessToken(req.user._id),
    };
  }
}
