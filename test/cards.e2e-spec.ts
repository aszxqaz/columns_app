import { INestApplication } from '@nestjs/common';
import { Column, User } from '@prisma/client';
import { ColumnService } from 'src/columns/columns.service';
import * as request from 'supertest';
import TestAgent from 'supertest/lib/agent';
import { setAuthHeader, setupApp } from './helpers';

describe('Cards', () => {
  let app: INestApplication;
  let agent: TestAgent;
  let users: {
    user: User;
    token: string;
  }[];
  let column: Column;

  beforeEach(async () => {
    const result = await setupApp({ usersCount: 2 });
    app = result.app;
    agent = request.agent(app.getHttpServer());
    users = result.users;
    const { token } = users[0];
    setAuthHeader(agent, token);

    const columnService = app.get(ColumnService);
    column = await columnService.create(users[0].user.id, {
      name: 'Test Column',
    });
  });

  describe('POST /users/:userId/columns/:columnId/cards', () => {
    it('returns 201 when the column is created successfully', async () => {
      const card = await agent
        .post(`/users/${users[0].user.id}/columns/${column.id}/cards`)
        .send({ name: 'Test Card', description: 'Test Description' })
        .expect(201)
        .then((res) => res.body);

      expect(card).toHaveProperty('id');
      expect(card).toHaveProperty('name', 'Test Card');
      expect(card).toHaveProperty('description', 'Test Description');
      expect(card).toHaveProperty('columnId', column.id);
    });

    it('returns 400 when the card name is too long', () => {
      const longName = 'a'.repeat(101);
      return agent
        .post(`/users/${users[0].user.id}/columns/${column.id}/cards`)
        .send({ name: longName, description: 'Test Description' })
        .expect(400);
    });

    it('returns 403 when the user does not match the provided userId', () => {
      return agent
        .post(`/users/${users[1].user.id}/columns/${column.id}/cards`)
        .send({ name: 'Test Card', description: 'Test Description' })
        .expect(403);
    });
  });

  describe('GET /users/:userId/columns/:columnId/cards', () => {
    it('GET /cards', async () => {
      setAuthHeader(agent, users[0].token);
      return agent
        .get(`/users/${users[0].user.id}/columns/${column.id}/cards`)
        .expect(200)
        .then((res) => {
          expect(res.body).toHaveLength(0);
        });
    });
  });

  describe('GET /users/:userId/columns/:columnId/cards/:id', () => {
    it('returns 400 when id is not a number', async () => {
      return agent
        .get(`/users/${users[0].user.id}/columns/${column.id}/cards/abc`)
        .expect(400);
    });

    it('returns 404 when card is not found', async () => {
      return agent
        .get(`/users/${users[0].user.id}/columns/${column.id}/cards/1`)
        .expect(404);
    });

    it('returns 200 when the card is found', async () => {
      const card = await agent
        .post(`/users/${users[0].user.id}/columns/${column.id}/cards`)
        .send({ name: 'Test Card', description: 'Test Description' })
        .expect(201)
        .then((res) => res.body);

      return agent
        .get(`/users/${users[0].user.id}/columns/${column.id}/cards/${card.id}`)
        .expect(200)
        .then((res) => {
          expect(res.body).toHaveProperty('id', card.id);
          expect(res.body).toHaveProperty('name', card.name);
          expect(res.body).toHaveProperty('description', card.description);
          expect(res.body).toHaveProperty('columnId', card.columnId);
        });
    });
  });

  describe('PUT /users/:userId/columns/:columnId/cards/:id', () => {
    it('returns 200 when the card is updated successfully', async () => {
      const card = await agent
        .post(`/users/${users[0].user.id}/columns/${column.id}/cards`)
        .send({ name: 'Test Card', description: 'Test Description' })
        .expect(201)
        .then((res) => res.body);
      const updatedName = 'Updated Test Card';
      return agent
        .put(`/users/${users[0].user.id}/columns/${column.id}/cards/${card.id}`)
        .send({ name: updatedName, description: 'Updated Test Description' })
        .expect(200)
        .then((res) => {
          expect(res.body).toHaveProperty('id', card.id);
          expect(res.body).toHaveProperty('name', updatedName);
          expect(res.body).toHaveProperty(
            'description',
            'Updated Test Description',
          );
          expect(res.body).toHaveProperty('columnId', card.columnId);
        });
    });

    it('returns 400 when the card id is not a number', async () => {
      return agent
        .put(`/users/${users[0].user.id}/columns/${column.id}/cards/abc`)
        .send({
          name: 'Updated Test Card',
          description: 'Updated Test Description',
        })
        .expect(400);
    });

    it('returns 400 when the card name is too long', async () => {
      const card = await agent
        .post(`/users/${users[0].user.id}/columns/${column.id}/cards`)
        .send({ name: 'Test Card', description: 'Test Description' })
        .expect(201)
        .then((res) => res.body);
      const longName = 'a'.repeat(101);
      return agent
        .put(`/users/${users[0].user.id}/columns/${column.id}/cards/${card.id}`)
        .send({ name: longName, description: 'Test Description' })
        .expect(400);
    });

    it('returns 403 when the user does not match the provided userId', () => {
      return agent
        .put(`/users/${users[1].user.id}/columns/${column.id}/cards/123`)
        .send({
          name: 'Updated Test Card',
          description: 'Updated Test Description',
        })
        .expect(403);
    });

    it('returns 404 when the card is not found', async () => {
      return agent
        .put(`/users/${users[0].user.id}/columns/${column.id}/cards/1`)
        .send({
          name: 'Updated Test Card',
          description: 'Updated Test Description',
        })
        .expect(404);
    });
  });

  describe('DELETE /users/:userId/columns/:columnId/cards/:id', () => {
    it('returns 204 when the card is deleted successfully', async () => {
      const card = await agent
        .post(`/users/${users[0].user.id}/columns/${column.id}/cards`)
        .send({ name: 'Test Card', description: 'Test Description' })
        .expect(201)
        .then((res) => res.body);

      return agent
        .delete(
          `/users/${users[0].user.id}/columns/${column.id}/cards/${card.id}`,
        )
        .expect(204);
    });

    it('returns 400 when the card id is not a number', async () => {
      return agent
        .delete(`/users/${users[0].user.id}/columns/${column.id}/cards/abc`)
        .expect(400);
    });

    it('returns 403 when the user does not match the provided userId', () => {
      return agent
        .delete(`/users/${users[1].user.id}/columns/${column.id}/cards/123`)
        .expect(403);
    });

    it('returns 404 when the card is not found', async () => {
      return agent
        .delete(`/users/${users[0].user.id}/columns/${column.id}/cards/1`)
        .expect(404);
    });
  });
});
