import {
  Controller,
  Get,
  UseGuards,
  Request,
  Post,
  Res,
  Query,
} from '@nestjs/common';
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
  async redirect(@Request() req: any, @Res() res) {
    const { accessToken } = await this.authService.findOneOrCreate(req.user);
    res.send(accessToken);
    //res.send(accessToken);
    res.status(302).redirect('https://redirect?token=' + accessToken);
  }

  @Get('/redirect')
  getAccessToken(@Query('token') token: string) {
    return token;
  }

  @Get('/facebook')
  @ApiTags('auth')
  @UseGuards(FacebookAuthGuard)
  protectedFB() {}

  @Get('/facebook-redirect')
  @UseGuards(FacebookAuthGuard)
  async redirectFacebook(@Request() req: any, @Res() res) {
    const { accessToken } = await this.authService.findOneOrCreate(req.user);
    res.status(302).redirect(`myapp://callback?token=${accessToken}`);
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
