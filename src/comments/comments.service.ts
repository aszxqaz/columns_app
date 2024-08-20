import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCommentDto } from './comments.dto';

type CreateArgs = {
  authorId: number;
  cardId: number;
} & CreateCommentDto;

type UpdateArgs = {
  commentId: number;
} & CreateCommentDto;

type FindAllArgs = {
  userId: number;
  columnId: number;
  cardId: number;
};

type FindByParamsArgs = FindAllArgs & {
  commentId: number;
};

@Injectable()
export class CommentsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(args: CreateArgs) {
    const { authorId, cardId, ...data } = args;
    return this.prismaService.comment.create({
      data: {
        ...data,
        user: { connect: { id: authorId } },
        card: { connect: { id: cardId } },
      },
    });
  }

  async findAllByParams(args: FindAllArgs) {
    const { userId, columnId, cardId } = args;
    const card = await this.prismaService.card.findUnique({
      where: {
        id: cardId,
        column: {
          id: columnId,
          user: {
            id: userId,
          },
        },
      },
    });

    if (!card) {
      return null;
    }

    const comments = await this.prismaService.comment.findMany({
      where: { cardId },
    });
    return comments;
  }

  async findOneByParams(args: FindByParamsArgs) {
    const { userId, columnId, cardId, commentId } = args;
    const comment = await this.prismaService.comment.findUnique({
      where: {
        id: commentId,
        card: {
          id: cardId,
          column: {
            id: columnId,
            user: {
              id: userId,
            },
          },
        },
      },
    });
    return comment;
  }

  async update(commentId: number, data: CreateCommentDto) {
    const comment = await this.prismaService.comment.update({
      where: { id: commentId },
      data,
    });
    return comment;
  }

  async delete(id: number) {
    const comment = await this.prismaService.comment.delete({
      where: { id },
    });
    return comment;
  }
}
