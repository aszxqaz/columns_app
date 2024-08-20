import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export type AuthTokenPayload = {
  userId: number;
};

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  async createAuthToken(payload: AuthTokenPayload) {
    const token = await this.jwtService.signAsync(payload);
    return token;
  }
}
