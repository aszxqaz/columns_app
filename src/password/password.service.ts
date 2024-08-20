import { Injectable } from '@nestjs/common';
import { hash, verify } from 'argon2';

@Injectable()
export class PasswordService {
  async hash(plain: string): Promise<string> {
    return await hash(plain);
  }

  async verify(hashed: string, plain: string): Promise<boolean> {
    return await verify(hashed, plain);
  }
}
