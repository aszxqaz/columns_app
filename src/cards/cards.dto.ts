import { PartialType, PickType } from '@nestjs/swagger';
import { Card as CardModel } from '@prisma/client';
import { Card } from './cards.swagger';

export class CreateCardDto
  extends PickType(Card, ['name', 'description'])
  implements Pick<CardModel, 'name' | 'description'> {}

export class UpdateCardDto
  extends PartialType(CreateCardDto)
  implements Partial<CreateCardDto> {}
