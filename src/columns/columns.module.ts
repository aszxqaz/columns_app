import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersModule } from 'src/users/users.module';
import { ColumnsController } from './columns.controller';
import { ColumnService } from './columns.service';

@Module({
  imports: [PrismaModule, ConfigModule, UsersModule],
  controllers: [ColumnsController],
  providers: [ColumnService],
  exports: [ColumnService],
})
export class ColumnsModule {}
