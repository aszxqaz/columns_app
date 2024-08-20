import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { User } from '@prisma/client';
import { CardsService } from 'src/cards/cards.service';
import {
  ColumnApiResponseCreated,
  ColumnApiResponseOK,
  ColumnListApiResponseOK,
} from 'src/columns/columns.swagger';
import { RequestorParam, RestrictedByUserId } from 'src/common/decorators';
import {
  CardIdParams,
  ColumnIdParams,
  CommentIdParams,
  UserIdParams,
} from 'src/common/params';
import {
  ApiResponseBadRequest,
  ApiResponseForbidden,
  ApiResponseNoContent,
  ApiResponseNotFound,
  ApiResponseUnauthorizedNotLoggedIn,
} from 'src/common/swagger';
import { Requestor } from 'src/users/users.service';
import { CreateCommentDto, UpdateCommentDto } from './comments.dto';
import { CommentsService } from './comments.service';

const commentIdParam = ':commentId';

@Controller()
@ApiTags('Comments')
@ApiBearerAuth()
@ApiResponseUnauthorizedNotLoggedIn()
@ApiResponseBadRequest()
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly cardService: CardsService,
  ) {}

  @Post()
  @RestrictedByUserId()
  @ApiOperation({ summary: 'Create a new comment' })
  @ApiParam(CardIdParams.asApiParamOptions)
  @ApiParam(ColumnIdParams.asApiParamOptions)
  @ApiParam(UserIdParams.asApiParamOptions)
  @ColumnApiResponseCreated()
  @ApiResponseForbidden()
  async create(
    @RequestorParam() user: User,
    @Param() { userId, columnId, cardId }: CardIdParams,
    @Body() dto: CreateCommentDto,
  ) {
    const card = await this.cardService.findOneByParams({
      cardId,
      columnId,
      userId,
    });
    if (!card) throw new NotFoundException();
    if (userId !== user.id) throw new ForbiddenException();
    const comment = await this.commentsService.create({
      ...dto,
      authorId: user.id,
      cardId,
    });
    return comment;
  }

  @Get()
  @ApiOperation({ summary: 'Find comments of a card' })
  @ApiParam(CardIdParams.asApiParamOptions)
  @ApiParam(ColumnIdParams.asApiParamOptions)
  @ApiParam(UserIdParams.asApiParamOptions)
  @ColumnListApiResponseOK()
  @ApiResponseNotFound()
  async findAllByParams(@Param() { userId, columnId, cardId }: CardIdParams) {
    const comments = await this.commentsService.findAllByParams({
      userId,
      columnId,
      cardId,
    });
    if (!comments) throw new NotFoundException();
    return comments;
  }

  @Get(commentIdParam)
  @ApiOperation({ summary: 'Find a comment' })
  @ApiParam(CommentIdParams.asApiParamOptions)
  @ApiParam(CardIdParams.asApiParamOptions)
  @ApiParam(ColumnIdParams.asApiParamOptions)
  @ApiParam(UserIdParams.asApiParamOptions)
  @ColumnApiResponseOK()
  @ApiResponseNotFound()
  async findOneByParams(
    @Param() { userId, columnId, cardId, commentId }: CommentIdParams,
  ) {
    const comment = await this.commentsService.findOneByParams({
      userId,
      columnId,
      cardId,
      commentId,
    });
    if (!comment) throw new NotFoundException();
    return comment;
  }

  @Put(commentIdParam)
  @RestrictedByUserId()
  @ApiOperation({ summary: 'Update a comment' })
  @ApiParam(CommentIdParams.asApiParamOptions)
  @ApiParam(CardIdParams.asApiParamOptions)
  @ApiParam(ColumnIdParams.asApiParamOptions)
  @ApiParam(UserIdParams.asApiParamOptions)
  @ColumnApiResponseOK()
  @ApiResponseNotFound()
  @ApiResponseForbidden()
  async update(
    @Param() { userId, columnId, cardId, commentId }: CommentIdParams,
    @Body() dto: UpdateCommentDto,
    @RequestorParam() user: Requestor,
  ) {
    let comment = await this.commentsService.findOneByParams({
      userId,
      columnId,
      cardId,
      commentId,
    });
    if (!comment) throw new NotFoundException();
    if (comment.authorId !== user.id) throw new ForbiddenException();
    comment = await this.commentsService.update(commentId, dto);
    if (!comment) throw new NotFoundException();
    return comment;
  }

  @Delete(commentIdParam)
  @HttpCode(HttpStatus.NO_CONTENT)
  @RestrictedByUserId()
  @ApiOperation({ summary: 'Delete a comment' })
  @ApiParam(CommentIdParams.asApiParamOptions)
  @ApiParam(CardIdParams.asApiParamOptions)
  @ApiParam(ColumnIdParams.asApiParamOptions)
  @ApiParam(UserIdParams.asApiParamOptions)
  @ApiResponseNoContent()
  @ApiResponseNotFound()
  @ApiResponseForbidden()
  async delete(
    @Param() { userId, columnId, cardId, commentId }: CommentIdParams,
    @RequestorParam() user: User,
  ) {
    let comment = await this.commentsService.findOneByParams({
      userId,
      columnId,
      cardId,
      commentId,
    });
    if (!comment) throw new NotFoundException();
    if (comment.authorId !== user.id) throw new ForbiddenException();
    comment = await this.commentsService.delete(commentId);
    if (!comment) throw new NotFoundException();
  }
}
