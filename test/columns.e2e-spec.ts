import { INestApplication } from '@nestjs/common';
import { User } from '@prisma/client';
import * as request from 'supertest';
import TestAgent from 'supertest/lib/agent';
import { setAuthHeader, setupApp } from './helpers';

describe('Columns', () => {
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
    const { token } = users[0];
    setAuthHeader(agent, token);
  });

  describe('POST /users/:userId/columns', () => {
    it('returns 403 when the user does not match the provided userId', async () => {
      return agent
        .post(`/users/${users[1].user.id}/columns`)
        .send({ name: 'name' })
        .expect(403);
    });

    it('returns 400 when the column name is too long', async () => {
      const longColumnName = 'a'.repeat(33);
      return agent
        .post(`/users/${users[0].user.id}/columns`)
        .send({ name: longColumnName })
        .expect(400);
    });

    it('returns 201 when the column is created successfully', async () => {
      const columnName = 'Test Column';
      return agent
        .post(`/users/${users[0].user.id}/columns`)
        .send({ name: columnName })
        .expect(201)
        .then((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('name', columnName);
          expect(res.body).toHaveProperty('ownerId', users[0].user.id);
        });
    });
  });

  describe('GET /users/:userId/columns', () => {
    it('GET /columns', async () => {
      setAuthHeader(agent, users[0].token);
      return agent
        .get(`/users/${users[0].user.id}/columns`)
        .expect(200)
        .then((res) => {
          expect(res.body).toHaveLength(0);
        });
    });
  });

  describe('GET /users/:userId/columns/:id', () => {
    it('returns 400 when id is not a number', async () => {
      return agent.get(`/users/${users[0].user.id}/columns/abc`).expect(400);
    });

    it('returns 404 when not found', async () => {
      return agent.get(`/users/${users[0].user.id}/columns/1`).expect(404);
    });

    it('returns 200 when found', async () => {
      const column = await agent
        .post(`/users/${users[0].user.id}/columns`)
        .send({ name: 'name' })
        .then((res) => res.body);

      return agent
        .get(`/users/${users[0].user.id}/columns/${column.id}`)
        .expect(200)
        .then((res) => {
          expect(res.body).toHaveProperty('id', column.id);
          expect(res.body).toHaveProperty('name', column.name);
          expect(res.body).toHaveProperty('ownerId', column.ownerId);
        });
    });
  });

  describe('PUT /users/:userId/columns/:id', () => {
    it('returns 404 when not found', async () => {
      const dto = { name: 'new name' };
      return agent
        .put(`/users/${users[0].user.id}/columns/99999`)
        .send(dto)
        .expect(404);
    });

    it('returns 200 when updated', async () => {
      const column = await agent
        .post(`/users/${users[0].user.id}/columns`)
        .send({ name: 'name' })
        .then((res) => res.body);

      const dto = { name: 'new name' };

      return agent
        .put(`/users/${users[0].user.id}/columns/${column.id}`)
        .send(dto)
        .expect(200)
        .then((res) => {
          expect(res.body).toHaveProperty('name', dto.name);
        });
    });

    it('returns 400 when name is not a number', async () => {
      const column = await agent
        .post(`/users/${users[0].user.id}/columns`)
        .send({ name: 'name' })
        .then((res) => res.body);

      const dto = { name: 123 };

      return agent
        .put(`/users/${users[0].user.id}/columns/${column.id}`)
        .send(dto)
        .expect(400);
    });

    it('returns 403 when the user does not match the provided userId', async () => {
      const column = await agent
        .post(`/users/${users[0].user.id}/columns`)
        .send({ name: 'name' })
        .then((res) => res.body);

      const dto = { name: 'new name' };

      return agent
        .put(`/users/${users[1].user.id}/columns/${column.id}`)
        .send(dto)
        .expect(403);
    });

    it('returns 400 when the column name is too long', async () => {
      const column = await agent
        .post(`/users/${users[0].user.id}/columns`)
        .send({ name: 'name' })
        .then((res) => res.body);

      const longColumnName = 'a'.repeat(33);
      const dto = { name: longColumnName };

      return agent
        .put(`/users/${users[0].user.id}/columns/${column.id}`)
        .send(dto)
        .expect(400);
    });

    it('returns 400 when the column name is not provided', async () => {
      const column = await agent
        .post(`/users/${users[0].user.id}/columns`)
        .send({ name: 'name' })
        .then((res) => res.body);

      const dto = {};

      return agent
        .put(`/users/${users[0].user.id}/columns/${column.id}`)
        .send(dto)
        .expect(400);
    });
  });

  describe('DELETE /users/:userId/columns/:id', () => {
    it('should delete a column', async () => {
      const column = await agent
        .post(`/users/${users[0].user.id}/columns`)
        .send({ name: 'name' })
        .then((res) => res.body);

      return agent
        .delete(`/users/${users[0].user.id}/columns/${column.id}`)
        .expect(204)
        .then(() =>
          agent
            .get(`/users/${users[0].user.id}/columns`)
            .expect(200)
            .then((res) => {
              expect(res.body).toHaveLength(0);
            }),
        );
    });

    it('should return 404 when trying to delete a non-existing column', async () => {
      return agent
        .delete(`/users/${users[0].user.id}/columns/99999`)
        .expect(404);
    });

    it('should return 403 when trying to delete a column that does not belong to the user', async () => {
      const column = await agent
        .post(`/users/${users[0].user.id}/columns`)
        .send({ name: 'name' })
        .then((res) => res.body);

      return agent
        .delete(`/users/${users[1].user.id}/columns/${column.id}`)
        .expect(403);
    });
  });
});
