import { ApiProperty } from '@nestjs/swagger';
import { Comment as CommentModel } from '@prisma/client';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { COMMENT_CONTENT_MAX_LENGTH } from 'src/common/constants';
import {
  TypedApiResponseCreated,
  TypedApiResponseOK,
} from 'src/common/swagger';

export class Comment implements CommentModel {
  @ApiProperty({ type: Number, example: 42, description: 'Comment ID' })
  id: number;

  @ApiProperty({
    type: String,
    example: 'This is a sample comment',
    description: 'Comment content',
  })
  @MaxLength(COMMENT_CONTENT_MAX_LENGTH)
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    type: Number,
    example: 13,
    description: 'User ID of the author',
  })
  authorId: number;

  @ApiProperty({
    type: Number,
    example: 27,
    description: 'Card ID the comment belongs to',
  })
  cardId: number;
}

export const CommentApiResponseOK = TypedApiResponseOK(Comment);
export const CommentApiResponseCreated = TypedApiResponseCreated(Comment);
export const CommentListApiResponseOK = TypedApiResponseOK([Comment]);
