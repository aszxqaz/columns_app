import { ApiProperty } from '@nestjs/swagger';
import { Card as CardModel } from '@prisma/client';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import {
  CARD_DESCRIPTION_MAX_LENGTH,
  CARD_NAME_MAX_LENGTH,
} from 'src/common/constants';
import {
  TypedApiResponseCreated,
  TypedApiResponseOK,
} from 'src/common/swagger';

export class Card implements CardModel {
  @ApiProperty({ type: Number, example: 42, description: 'Card ID' })
  id: number;

  @ApiProperty({
    type: String,
    example: 'Sample Card',
    description: 'Card name',
  })
  @MaxLength(CARD_NAME_MAX_LENGTH)
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    type: String,
    example: 'Sample card description',
    description: 'Card description',
  })
  @MaxLength(CARD_DESCRIPTION_MAX_LENGTH)
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    type: Number,
    example: 13,
    description: 'ID of the column the card belongs to',
  })
  columnId: number;
}

export const CardApiResponseOK = TypedApiResponseOK(Card);
export const CardApiResponseCreated = TypedApiResponseCreated(Card);
export const CardListApiResponseOK = TypedApiResponseOK([Card]);
