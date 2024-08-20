import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export enum PrismaError {
  UNIQUE_CONSTRAINT_VIOLATION = 'P2002',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(config: ConfigService) {
    const url = config.get<string>('DATABASE_URL');
    super({
      datasources: {
        db: {
          url,
        },
      },
    });
  }

  mapError(error: unknown) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === PrismaError.UNIQUE_CONSTRAINT_VIOLATION) {
        return PrismaError.UNIQUE_CONSTRAINT_VIOLATION;
      }
    }
    return PrismaError.UNKNOWN_ERROR;
  }
}
