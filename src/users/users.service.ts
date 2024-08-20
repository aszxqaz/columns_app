import { Injectable, Logger } from '@nestjs/common';
import { InternalUser, User, UserRole } from '@prisma/client';
import { PasswordService } from 'src/password/password.service';
import { PrismaError, PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './users.dto';

export class Requestor {
  id: number;
  email: string;
  role: UserRole;

  static toUser(requestor: Requestor): User {
    return {
      id: requestor.id,
      email: requestor.email,
    };
  }
}

export enum UsersServiceError {
  EMAIL_ALREADY_IN_USE,
  UNKNOWN_ERROR,
}

@Injectable()
export class UserService {
  private logger = new Logger('UserService');

  constructor(
    private readonly prismaService: PrismaService,
    private readonly passwordService: PasswordService,
  ) {}

  async create(data: CreateUserDto) {
    let { email, password } = data;
    try {
      const passwordHash = await this.passwordService.hash(password);
      email = email.toLowerCase();
      const user = await this.prismaService.user.create({
        data: { email, internalUser: { create: { passwordHash } } },
      });
      return user;
    } catch (e) {
      if (
        this.prismaService.mapError(e) ===
        PrismaError.UNIQUE_CONSTRAINT_VIOLATION
      ) {
        return UsersServiceError.EMAIL_ALREADY_IN_USE;
      } else {
        return UsersServiceError.UNKNOWN_ERROR;
      }
    }
  }

  async getRequestorFromUserId(userId: number) {
    const unsafeUser = await this.prismaService.user.findUnique({
      where: { id: userId },
      include: {
        internalUser: true,
      },
    });
    if (!unsafeUser) return null;
    return this.mapUnsafeUserToRequestor(unsafeUser);
  }

  async getRequestorFromEmail(email: string) {
    const unsafeUser = await this.prismaService.user.findUnique({
      where: { email },
      include: {
        internalUser: true,
      },
    });
    if (!unsafeUser) return null;
    return this.mapUnsafeUserToRequestor(unsafeUser);
  }

  async findOneById(id: number) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      select: { id: true, email: true },
    });
    return user;
  }

  async findAll() {
    const users = await this.prismaService.user.findMany({
      orderBy: {
        id: 'asc',
      },
    });
    return users;
  }

  async findOneByEmailInternal(email: string) {
    email = email.toLowerCase();
    const user = await this.prismaService.user.findUnique({
      where: { email },
      include: { internalUser: true },
    });
    return user;
  }

  async update(userId: number, data: UpdateUserDto) {
    let { email, password } = data;
    try {
      let passwordHash: string;
      if (password) {
        passwordHash = await this.passwordService.hash(password);
      }
      email = email?.toLowerCase();
      const user = await this.prismaService.user.update({
        where: { id: userId },
        data: { email, internalUser: { update: { passwordHash } } },
      });
      return user;
    } catch (e) {
      if (
        this.prismaService.mapError(e) ===
        PrismaError.UNIQUE_CONSTRAINT_VIOLATION
      ) {
        return UsersServiceError.EMAIL_ALREADY_IN_USE;
      } else {
        this.logger.error(e);
        return UsersServiceError.UNKNOWN_ERROR;
      }
    }
  }

  async delete(id: number) {
    const user = await this.prismaService.user.delete({ where: { id } });
    return user;
  }

  private mapUnsafeUserToRequestor(
    unsafeUser: User & { internalUser: InternalUser },
  ): Requestor {
    const { internalUser, ...plainUser } = unsafeUser;
    const user = {
      role: internalUser.role,
      ...plainUser,
    };
    return user;
  }
}
