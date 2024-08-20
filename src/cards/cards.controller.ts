import {
  Body,
  Controller,
  Delete,
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
import { ColumnService } from 'src/columns/columns.service';
import { RestrictedByUserId } from 'src/common/decorators';
import { CardIdParams, ColumnIdParams, UserIdParams } from 'src/common/params';
import {
  ApiResponseBadRequest,
  ApiResponseForbidden,
  ApiResponseNoContent,
  ApiResponseNotFound,
  ApiResponseUnauthorizedNotLoggedIn,
} from 'src/common/swagger';
import { CreateCardDto, UpdateCardDto } from './cards.dto';
import { CardsService } from './cards.service';
import {
  CardApiResponseCreated,
  CardApiResponseOK,
  CardListApiResponseOK,
} from './cards.swagger';

const cardIdParam = ':cardId';

@Controller()
@ApiTags('Cards')
@ApiBearerAuth()
@ApiResponseUnauthorizedNotLoggedIn()
@ApiResponseBadRequest()
export class CardsController {
  constructor(
    private readonly cardsService: CardsService,
    private readonly columnsService: ColumnService,
  ) {}

  @Post()
  @RestrictedByUserId()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new card' })
  @ApiParam(UserIdParams.asApiParamOptions)
  @CardApiResponseCreated()
  @ApiResponseForbidden()
  async create(
    @Param() { columnId, userId }: ColumnIdParams,
    @Body() dto: CreateCardDto,
  ) {
    const column = await this.columnsService.findOneByParams({
      userId,
      columnId,
    });
    if (!column) throw new NotFoundException();
    const card = await this.cardsService.create(columnId, dto);
    return card;
  }

  @Get()
  @ApiOperation({ summary: 'Find all cards in the column' })
  @ApiParam(ColumnIdParams.asApiParamOptions)
  @ApiParam(UserIdParams.asApiParamOptions)
  @CardListApiResponseOK()
  @ApiResponseNotFound()
  async findAllByParams(@Param() { userId, columnId }: ColumnIdParams) {
    const cards = await this.cardsService.findAllByParams({ userId, columnId });
    if (!cards) throw new NotFoundException();
    return cards;
  }

  @Get(cardIdParam)
  @ApiOperation({ summary: 'Find a card' })
  @ApiParam(CardIdParams.asApiParamOptions)
  @ApiParam(ColumnIdParams.asApiParamOptions)
  @ApiParam(UserIdParams.asApiParamOptions)
  @CardApiResponseOK()
  @ApiResponseNotFound()
  async findOneByParams(@Param() { cardId, columnId, userId }: CardIdParams) {
    const card = await this.cardsService.findOneByParams({
      userId,
      columnId,
      cardId,
    });
    if (!card) throw new NotFoundException();
    return card;
  }

  @Put(cardIdParam)
  @RestrictedByUserId()
  @ApiOperation({ summary: 'Update a card' })
  @ApiParam(CardIdParams.asApiParamOptions)
  @ApiParam(ColumnIdParams.asApiParamOptions)
  @ApiParam(UserIdParams.asApiParamOptions)
  @CardApiResponseOK()
  @ApiResponseNotFound()
  @ApiResponseForbidden()
  async update(
    @Param() { userId, columnId, cardId }: CardIdParams,
    @Body() dto: UpdateCardDto,
  ) {
    let card = await this.cardsService.findOneByParams({
      userId,
      columnId,
      cardId,
    });
    if (!card) throw new NotFoundException();
    card = await this.cardsService.update(cardId, dto);
    if (!card) throw new NotFoundException();
    return card;
  }

  @Delete(cardIdParam)
  @HttpCode(HttpStatus.NO_CONTENT)
  @RestrictedByUserId()
  @ApiOperation({ summary: 'Delete a card' })
  @ApiParam(CardIdParams.asApiParamOptions)
  @ApiParam(ColumnIdParams.asApiParamOptions)
  @ApiParam(UserIdParams.asApiParamOptions)
  @ApiResponseNoContent()
  @ApiResponseNotFound()
  @ApiResponseForbidden()
  async delete(@Param() { userId, columnId, cardId }: CardIdParams) {
    let card = await this.cardsService.findOneByParams({
      userId,
      columnId,
      cardId,
    });
    if (!card) throw new NotFoundException();
    card = await this.cardsService.delete(cardId);
    if (!card) throw new NotFoundException();
  }
}
