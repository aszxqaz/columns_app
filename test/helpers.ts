import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@prisma/client';
import { AppModule } from 'src/app.module';
import { DefaultValidationPipe } from 'src/common/pipes';
import { PrismaService } from 'src/prisma/prisma.service';
import { TokenService } from 'src/tokens/tokens.service';
import { UserService } from 'src/users/users.service';
import TestAgent from 'supertest/lib/agent';

export function setAuthHeader(agent: TestAgent, token: string) {
  agent.set('Authorization', `Bearer ${token}`);
}

type SetupConfig = {
  usersCount: number;
};

export async function setupApp({ usersCount }: SetupConfig) {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(new DefaultValidationPipe());
  await app.init();

  const prisma = moduleFixture.get(PrismaService);
  const userService = moduleFixture.get(UserService);
  const tokenService = moduleFixture.get(TokenService);
  await prisma.$executeRaw`DELETE FROM users;`;

  const users: { user: User; token: string }[] = [];

  for (let i = 0; i < usersCount; i++) {
    const userDto = { email: `test${i}@example.com`, password: 'testpassword' };
    const user = (await userService.create(userDto)) as User;
    const token = await tokenService.createAuthToken({ userId: user.id });

    users.push({ user, token });
  }

  return { app, users };
}
