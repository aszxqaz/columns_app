import { ApiParamOptions } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class UserIdParams {
  @IsNumber({ allowNaN: false })
  @Transform(({ value }) => {
    return Number(value);
  })
  userId: number;

  static asApiParamOptions: ApiParamOptions = {
    name: 'userId',
    type: Number,
    required: true,
    description: 'User ID',
  };
}

export class ColumnIdParams extends UserIdParams {
  @IsNumber({ allowNaN: false })
  @Transform(({ value }) => {
    return Number(value);
  })
  columnId: number;

  static asApiParamOptions: ApiParamOptions = {
    name: 'columnId',
    type: Number,
    required: true,
    description: 'Column ID',
  };
}

export class CardIdParams extends ColumnIdParams {
  @IsNumber({ allowNaN: false })
  @Transform(({ value }) => {
    return Number(value);
  })
  cardId: number;

  static asApiParamOptions: ApiParamOptions = {
    name: 'cardId',
    type: Number,
    required: true,
    description: 'Card ID',
  };
}

export class CommentIdParams extends CardIdParams {
  @IsNumber({ allowNaN: false })
  @Transform(({ value }) => {
    return Number(value);
  })
  commentId: number;

  static asApiParamOptions: ApiParamOptions = {
    name: 'commentId',
    type: Number,
    required: true,
    description: 'Comment ID',
  };
}
