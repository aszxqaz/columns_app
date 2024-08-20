import { Module } from '@nestjs/common';
import { ColumnsModule } from 'src/columns/columns.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CardsController } from './cards.controller';
import { CardsService } from './cards.service';

@Module({
  imports: [PrismaModule, ColumnsModule],
  controllers: [CardsController],
  providers: [CardsService],
  exports: [CardsService],
})
export class CardsModule {}
