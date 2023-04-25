import { AuthGuard } from '@nestjs/passport';

export default class JWTAuthGuard extends AuthGuard('jwt') {}
