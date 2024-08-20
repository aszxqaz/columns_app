import { PickType } from '@nestjs/swagger';
import { Comment as CommentModel } from '@prisma/client';
import { Comment } from './comments.swagger';

export class CreateCommentDto
  extends PickType(Comment, ['content'])
  implements Pick<CommentModel, 'content'> {}

export class UpdateCommentDto extends CreateCommentDto {}
