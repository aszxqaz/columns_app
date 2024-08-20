import { ApiProperty } from '@nestjs/swagger';
import { Column as ColumnModel } from '@prisma/client';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { COLUMN_NAME_MAX_LENGTH } from 'src/common/constants';
import {
  TypedApiResponseCreated,
  TypedApiResponseOK,
} from 'src/common/swagger';

export class Column implements ColumnModel {
  @ApiProperty({ type: Number, example: 13, description: 'Column ID' })
  id: number;

  @ApiProperty({
    type: String,
    example: 'Sample column',
    description: 'Column name',
  })
  @MaxLength(COLUMN_NAME_MAX_LENGTH)
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    type: Number,
    example: 42,
    description: 'User ID of the owner',
  })
  ownerId: number;
}

export const ColumnApiResponseOK = TypedApiResponseOK(Column);
export const ColumnApiResponseCreated = TypedApiResponseCreated(Column);
export const ColumnListApiResponseOK = TypedApiResponseOK([Column]);
