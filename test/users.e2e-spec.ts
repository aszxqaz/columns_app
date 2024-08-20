import { INestApplication } from '@nestjs/common';
import { User } from '@prisma/client';
import * as request from 'supertest';
import TestAgent from 'supertest/lib/agent';
import { setAuthHeader, setupApp } from './helpers';

describe('Users', () => {
  let app: INestApplication;
  let agent: TestAgent;
  let users: {
    user: User;
    token: string;
  }[];

  beforeEach(async () => {
    const result = await setupApp({ usersCount: 2 });
    app = result.app;
    agent = request.agent(app.getHttpServer());
    users = result.users;
  });

  describe('/users', () => {
    it('GET /users', async () => {
      setAuthHeader(agent, users[0].token);
      return agent
        .get('/users')
        .expect(200)
        .then((res) => {
          expect(res.body).toHaveLength(2);
        });
    });
  });

  describe('/users/:id', () => {
    it('should find a user when it exists', async () => {
      const { token, user } = users[0];
      setAuthHeader(agent, token);
      return agent
        .get(`/users/${user.id}`)
        .expect(200)
        .then((res) => {
          expect(res.body).toEqual({ id: user.id, email: user.email });
        });
    });

    it('should return 401 when not authorized', async () => {
      const { token, user } = users[0];
      setAuthHeader(agent, '');
      return agent.get(`/users/${user.id}`).expect(401);
    });

    it('should return 404 when user does not exist', async () => {
      const { token, user } = users[0];
      setAuthHeader(agent, token);
      return agent.get(`/users/999`).expect(404);
    });

    it('should return 400 when user id is not a number (GET)', async () => {
      const { token, user } = users[0];
      setAuthHeader(agent, token);
      return agent.get(`/users/not-a-number`).expect(400);
    });

    it('should update the user', async () => {
      const { token, user } = users[0];
      setAuthHeader(agent, token);
      const updatedEmail = 'new-email@example.com';
      await agent
        .put(`/users/${user.id}`)
        .send({ email: updatedEmail })
        .expect(200)
        .then((res) => {
          expect(res.body).toEqual({ id: user.id, email: updatedEmail });
        });
      return agent
        .get(`/users/${user.id}`)
        .expect(200)
        .then((res) => {
          expect(res.body).toEqual({ id: user.id, email: updatedEmail });
        });
    });

    it('should return 403 when trying to update another user', async () => {
      const { token, user } = users[0];
      setAuthHeader(agent, token);
      const anotherUser = users[1].user;
      const updatedEmail = 'new-email@example.com';
      await agent
        .put(`/users/${anotherUser.id}`)
        .send({ email: updatedEmail })
        .expect(403);
    });

    it('should delete the user and return 401', async () => {
      const { token, user } = users[0];
      setAuthHeader(agent, token);
      await agent.delete(`/users/${user.id}`).expect(204);
      await agent.get(`/users/${user.id}`).expect(401);
    });
  });
});
