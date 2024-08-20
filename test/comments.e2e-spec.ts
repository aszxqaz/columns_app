import { INestApplication } from '@nestjs/common';
import { Card, Column, User } from '@prisma/client';
import { CardsService } from 'src/cards/cards.service';
import { ColumnService } from 'src/columns/columns.service';
import { COMMENT_CONTENT_MAX_LENGTH } from 'src/common/constants';
import * as request from 'supertest';
import TestAgent from 'supertest/lib/agent';
import { setAuthHeader, setupApp } from './helpers';

describe('Comments', () => {
  let app: INestApplication;
  let agent: TestAgent;
  let users: {
    user: User;
    token: string;
  }[];
  let column: Column;
  let card: Card;

  beforeEach(async () => {
    const result = await setupApp({ usersCount: 2 });
    app = result.app;
    agent = request.agent(app.getHttpServer());
    users = result.users;
    const { token } = users[0];
    setAuthHeader(agent, token);

    const columnService = app.get(ColumnService);
    const cardService = app.get(CardsService);
    column = await columnService.create(users[0].user.id, {
      name: 'Test Column',
    });
    card = await cardService.create(column.id, {
      name: 'Test Card',
      description: 'Test Description',
    });
  });

  describe('POST /users/:userId/columns/:columnId/cards/:cardId/comments', () => {
    it('returns 201 when the comment is created successfully', async () => {
      return agent
        .post(
          `/users/${users[0].user.id}/columns/${column.id}/cards/${card.id}/comments`,
        )
        .send({ content: 'Test Comment' })
        .expect(201)
        .then((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('content', 'Test Comment');
          expect(res.body).toHaveProperty('cardId', card.id);
          expect(res.body).toHaveProperty('authorId', users[0].user.id);
        });
    });

    it('returns 400 when the comment content is too long', () => {
      const longContent = 'a'.repeat(COMMENT_CONTENT_MAX_LENGTH + 1);
      return agent
        .post(
          `/users/${users[0].user.id}/columns/${column.id}/cards/${card.id}/comments`,
        )
        .send({ content: longContent })
        .expect(400);
    });

    it('returns 403 when the user does not match the provided userId', () => {
      return agent
        .post(
          `/users/${users[1].user.id}/columns/${column.id}/cards/${card.id}/comments`,
        )
        .send({ content: 'Test Comment' })
        .expect(403);
    });
  });

  describe('GET /users/:userId/columns/:columnId/cards/:cardId/comments', () => {
    it('should return comments', async () => {
      setAuthHeader(agent, users[0].token);
      const comment = await agent
        .post(
          `/users/${users[0].user.id}/columns/${column.id}/cards/${card.id}/comments`,
        )
        .send({ content: 'Test Comment' })
        .then((res) => res.body);
      return agent
        .get(
          `/users/${users[0].user.id}/columns/${column.id}/cards/${card.id}/comments`,
        )
        .expect(200)
        .then((res) => {
          expect(res.body).toHaveLength(1);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('content', 'Test Comment');
          expect(res.body[0]).toHaveProperty('cardId', card.id);
          expect(res.body[0]).toHaveProperty('authorId', users[0].user.id);
        });
    });
  });

  describe('GET /users/:userId/columns/:columnId/cards/:cardId/comments/:commentId', () => {
    it('returns 400 when id is not a number', async () => {
      return agent
        .get(
          `/users/${users[0].user.id}/columns/${column.id}/cards/abc/comments/123`,
        )
        .expect(400);
    });

    it('returns 404 when the comment is not found', async () => {
      return agent
        .get(
          `/users/${users[0].user.id}/columns/${column.id}/cards/${card.id}/comments/123`,
        )
        .expect(404);
    });

    it('returns 200 when the comment is found', async () => {
      setAuthHeader(agent, users[0].token);
      const comment = await agent
        .post(
          `/users/${users[0].user.id}/columns/${column.id}/cards/${card.id}/comments`,
        )
        .send({ content: 'Test Comment' })
        .expect(201)
        .then((res) => res.body);
      return agent
        .get(
          `/users/${users[0].user.id}/columns/${column.id}/cards/${card.id}/comments/${comment.id}`,
        )
        .expect(200)
        .then((res) => {
          expect(res.body).toHaveProperty('id', comment.id);
          expect(res.body).toHaveProperty('content', 'Test Comment');
          expect(res.body).toHaveProperty('cardId', card.id);
          expect(res.body).toHaveProperty('authorId', users[0].user.id);
        });
    });
  });

  describe('PUT /users/:userId/columns/:columnId/cards/:cardId/comments/:commentId', () => {
    it('returns 200 when the comment is updated successfully', async () => {
      setAuthHeader(agent, users[0].token);
      const comment = await agent
        .post(
          `/users/${users[0].user.id}/columns/${column.id}/cards/${card.id}/comments`,
        )
        .send({ content: 'Test Comment' })
        .expect(201)
        .then((res) => res.body);
      return agent
        .put(
          `/users/${users[0].user.id}/columns/${column.id}/cards/${card.id}/comments/${comment.id}`,
        )
        .send({ content: 'Updated Test Comment' })
        .expect(200)
        .then((res) => {
          expect(res.body).toHaveProperty('id', comment.id);
          expect(res.body).toHaveProperty('content', 'Updated Test Comment');
          expect(res.body).toHaveProperty('cardId', card.id);
          expect(res.body).toHaveProperty('authorId', users[0].user.id);
        });
    });

    it('returns 400 when the comment id is not a number', async () => {
      return agent
        .put(
          `/users/${users[0].user.id}/columns/${column.id}/cards/abc/comments/123`,
        )
        .send({ content: 'Updated Test Comment' })
        .expect(400);
    });

    it('returns 400 when the comment content is too long', async () => {
      const comment = await agent
        .post(
          `/users/${users[0].user.id}/columns/${column.id}/cards/${card.id}/comments`,
        )
        .send({ content: 'Test Comment' })
        .expect(201)
        .then((res) => res.body);
      return agent
        .put(
          `/users/${users[0].user.id}/columns/${column.id}/cards/${card.id}/comments/${comment.id}`,
        )
        .send({ content: 'A'.repeat(COMMENT_CONTENT_MAX_LENGTH + 1) })
        .expect(400);
    });

    it('returns 403 when the user does not match the provided userId', async () => {
      setAuthHeader(agent, users[0].token);
      const comment = await agent
        .post(
          `/users/${users[0].user.id}/columns/${column.id}/cards/${card.id}/comments`,
        )
        .send({ content: 'Test Comment' })
        .expect(201)
        .then((res) => res.body);
      setAuthHeader(agent, users[1].token);
      return agent
        .put(
          `/users/${users[0].user.id}/columns/${column.id}/cards/${card.id}/comments/${comment.id}`,
        )
        .send({ content: 'Updated Test Comment' })
        .expect(403);
    });

    it('returns 404 when the comment is not found', async () => {
      return agent
        .put(
          `/users/${users[0].user.id}/columns/${column.id}/cards/${card.id}/comments/99999`,
        )
        .send({ content: 'Updated Test Comment' })
        .expect(404);
    });
  });

  describe('DELETE /users/:userId/columns/:columnId/cards/:cardId/comments/:commentId', () => {
    it('returns 204 when the comment is deleted successfully', async () => {
      setAuthHeader(agent, users[0].token);
      const comment = await agent
        .post(
          `/users/${users[0].user.id}/columns/${column.id}/cards/${card.id}/comments`,
        )
        .send({ content: 'Test Comment' })
        .expect(201)
        .then((res) => res.body);
      return agent
        .delete(
          `/users/${users[0].user.id}/columns/${column.id}/cards/${card.id}/comments/${comment.id}`,
        )
        .expect(204);
    });

    it('returns 400 when the comment id is not a number', async () => {
      return agent
        .delete(
          `/users/${users[0].user.id}/columns/${column.id}/cards/${card.id}/comments/not-a-number`,
        )
        .expect(400);
    });

    it('returns 403 when the user id does not match the provided userId', async () => {
      return agent
        .delete(
          `/users/${users[1].user.id}/columns/${column.id}/cards/${card.id}/comments/123`,
        )
        .expect(403);
    });

    it('returns 404 when the comment is not found', async () => {
      return agent
        .delete(
          `/users/${users[0].user.id}/columns/${column.id}/cards/${card.id}/comments/99999`,
        )
        .expect(404);
    });
  });
});
