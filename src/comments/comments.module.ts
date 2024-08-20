import { Module } from '@nestjs/common';
import { CardsModule } from 'src/cards/cards.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';

@Module({
  imports: [CardsModule, PrismaModule],
  exports: [CommentsService],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
