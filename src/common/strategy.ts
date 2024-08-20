import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthTokenPayload } from 'src/tokens/tokens.service';
import { Requestor } from 'src/users/users.service';
import { UserService } from '../users/users.service';

export type RequestWithUser = Request & {
  user: Requestor;
};

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly config: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: AuthTokenPayload) {
    const user = await this.userService.getRequestorFromUserId(payload.userId);
    if (!user) return null;
    return user;
  }
}
