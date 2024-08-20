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
import { User, UserRole } from '@prisma/client';
import { RequestorParam, RestrictedByUserId } from 'src/common/decorators';
import { ColumnIdParams, UserIdParams } from 'src/common/params';
import {
  ApiResponseBadRequest,
  ApiResponseForbidden,
  ApiResponseNoContent,
  ApiResponseNotFound,
  ApiResponseUnauthorizedNotLoggedIn,
} from 'src/common/swagger';
import { Requestor, UserService } from 'src/users/users.service';
import { CreateColumnDto, UpdateColumnDto } from './columns.dto';
import { ColumnService } from './columns.service';
import {
  ColumnApiResponseCreated,
  ColumnApiResponseOK,
  ColumnListApiResponseOK,
} from './columns.swagger';

const columnIdParam = ':columnId';

@Controller()
@ApiTags('Columns')
@ApiBearerAuth()
@ApiResponseUnauthorizedNotLoggedIn()
@ApiResponseBadRequest()
export class ColumnsController {
  constructor(
    private readonly columnsService: ColumnService,
    private readonly usersService: UserService,
  ) {}

  @Post()
  @RestrictedByUserId()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new column' })
  @ApiParam(UserIdParams.asApiParamOptions)
  @ColumnApiResponseCreated()
  @ApiResponseForbidden()
  async create(
    @RequestorParam() author: Requestor,
    @Param() { userId }: UserIdParams,
    @Body() dto: CreateColumnDto,
  ) {
    const user = await this.usersService.findOneById(userId);
    if (!user) throw new NotFoundException();
    if (user.id !== userId) throw new ForbiddenException();
    const column = await this.columnsService.create(userId, dto);
    return column;
  }

  @Get()
  @ApiOperation({ summary: 'Find all columns owned by a user' })
  @ApiParam(UserIdParams.asApiParamOptions)
  @ColumnListApiResponseOK()
  @ApiResponseNotFound()
  async findAllByParams(@Param() { userId }: UserIdParams) {
    const columns = await this.columnsService.findAllByParams({ userId });
    if (!columns) throw new NotFoundException();
    return columns;
  }

  @Get(columnIdParam)
  @ApiOperation({ summary: 'Find a column' })
  @ApiParam(ColumnIdParams.asApiParamOptions)
  @ApiParam(UserIdParams.asApiParamOptions)
  @ColumnApiResponseOK()
  @ApiResponseNotFound()
  async findOneByParams(@Param() { userId, columnId }: ColumnIdParams) {
    const column = await this.columnsService.findOneByParams({
      columnId,
      userId,
    });
    if (!column) throw new NotFoundException();
    return column;
  }

  @Put(columnIdParam)
  @RestrictedByUserId()
  @ApiOperation({ summary: 'Update a column' })
  @ApiParam(ColumnIdParams.asApiParamOptions)
  @ApiParam(UserIdParams.asApiParamOptions)
  @ColumnApiResponseOK()
  @ApiResponseNotFound()
  @ApiResponseForbidden()
  async update(
    @Param() { userId, columnId }: ColumnIdParams,
    @Body() dto: UpdateColumnDto,
    @RequestorParam() requestor: Requestor,
  ) {
    let column = await this.columnsService.findOneByParams({
      userId,
      columnId,
    });
    if (!column) throw new NotFoundException();
    if (userId !== requestor.id && requestor.role !== UserRole.admin)
      throw new ForbiddenException();
    column = await this.columnsService.update(columnId, dto);
    if (!column) throw new NotFoundException();
    return column;
  }

  @Delete(columnIdParam)
  @HttpCode(HttpStatus.NO_CONTENT)
  @RestrictedByUserId()
  @ApiOperation({ summary: 'Delete a column' })
  @ApiParam(ColumnIdParams.asApiParamOptions)
  @ApiParam(UserIdParams.asApiParamOptions)
  @ApiResponseNoContent()
  @ApiResponseNotFound()
  @ApiResponseForbidden()
  async delete(
    @Param() { userId, columnId }: ColumnIdParams,
    @RequestorParam() user: User,
  ) {
    let column = await this.columnsService.findOneByParams({
      userId,
      columnId,
    });
    if (!column) throw new NotFoundException();
    if (column.ownerId !== user.id) throw new ForbiddenException();
    column = await this.columnsService.delete(columnId);
    if (!column) throw new NotFoundException();
  }
}
