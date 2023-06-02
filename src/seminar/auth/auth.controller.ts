import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBody, ApiCreatedResponse } from '@nestjs/swagger';
import { AuthService } from 'src/auth/auth.service';
import { AccessTokenDTO } from 'src/auth/dto/access-token.dto';
import { LocalLoginDTO } from 'src/auth/dto/local.dto';
import LocalAuthGuard from 'src/auth/guards/local.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

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
