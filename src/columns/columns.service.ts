import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/users/users.service';
import { CreateColumnDto, UpdateColumnDto } from './columns.dto';

type FindAllByParamsArgs = {
  userId: number;
};

type FindOneByParamsArgs = FindAllByParamsArgs & {
  columnId: number;
};

@Injectable()
export class ColumnService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
  ) {}

  async create(userId: number, data: CreateColumnDto) {
    const column = await this.prismaService.column.create({
      data: {
        ...data,
        user: {
          connect: { id: userId },
        },
      },
    });
    return column;
  }

  async findOneByParams(args: FindOneByParamsArgs) {
    const { userId, columnId } = args;
    const column = await this.prismaService.column.findUnique({
      where: {
        id: columnId,
        ownerId: userId,
      },
    });
    return column;
  }

  async findAllByParams(args: FindAllByParamsArgs) {
    const { userId } = args;
    const user = await this.userService.findOneById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const columns = await this.prismaService.column.findMany({
      where: {
        ownerId: userId,
      },
    });
    return columns;
  }

  async update(columnId: number, data: UpdateColumnDto) {
    const column = await this.prismaService.column.update({
      where: { id: columnId },
      data,
    });
    return column;
  }

  async delete(columnId: number) {
    const column = await this.prismaService.column.delete({
      where: { id: columnId },
    });
    return column;
  }
}
