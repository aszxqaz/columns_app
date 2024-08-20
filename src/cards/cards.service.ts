import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCardDto, UpdateCardDto } from './cards.dto';

type FindAllByParamsArgs = {
  userId: number;
  columnId: number;
};

type FindOneByParamsArgs = FindAllByParamsArgs & {
  cardId: number;
};

type CreateArgs = {
  columnId: number;
} & CreateCardDto;

@Injectable()
export class CardsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(columnId: number, data: CreateCardDto) {
    const card = await this.prismaService.card.create({
      data: {
        ...data,
        column: {
          connect: { id: columnId },
        },
      },
    });
    return card;
  }

  async findAllByParams(args: FindAllByParamsArgs) {
    const { userId, columnId } = args;
    const column = await this.prismaService.column.findUnique({
      where: {
        id: columnId,
        user: {
          id: userId,
        },
      },
    });

    if (!column) {
      return null;
    }

    return this.prismaService.card.findMany({
      where: { columnId },
    });
  }

  async findOneByParams(args: FindOneByParamsArgs) {
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

    return card;
  }

  async update(cardId: number, data: UpdateCardDto) {
    const card = await this.prismaService.card.update({
      where: { id: cardId },
      data,
    });
    return card;
  }

  async delete(cardId: number) {
    const card = await this.prismaService.card.delete({
      where: { id: cardId },
    });
    return card;
  }
}
