import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
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
import {
  Public,
  RequestorParam,
  RestrictedByUserId,
} from 'src/common/decorators';
import { UserIdParams } from 'src/common/params';
import {
  ApiResponseBadRequest,
  ApiResponseConflictEmailTaken,
  ApiResponseForbidden,
  ApiResponseNoContent,
  ApiResponseNotFound,
  ApiResponseUnauthorizedNotLoggedIn,
} from 'src/common/swagger';
import { CreateUserDto, UpdateUserDto } from './users.dto';
import { Requestor, UserService, UsersServiceError } from './users.service';
import {
  UserApiResponseCreated,
  UserApiResponseOK,
  UserListApiResponseOK,
} from './users.swagger';

const userIdParam = ':userId';

const EMAIL_ALREADY_IN_USE = new ConflictException('Email already in use');

@ApiTags('Users')
@Controller()
export class UsersController {
  constructor(private readonly usersService: UserService) {}

  @Get('/me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get logged in user details' })
  @UserApiResponseOK()
  @ApiResponseUnauthorizedNotLoggedIn()
  async me(@RequestorParam() requestor: Requestor): Promise<User> {
    return Requestor.toUser(requestor);
  }

  @Public()
  @Post()
  @ApiOperation({ summary: 'Create a user' })
  @UserApiResponseCreated()
  @ApiResponseBadRequest()
  @ApiResponseConflictEmailTaken()
  async create(@Body() dto: CreateUserDto): Promise<User> {
    const result = await this.usersService.create(dto);
    switch (result) {
      case UsersServiceError.EMAIL_ALREADY_IN_USE:
        throw EMAIL_ALREADY_IN_USE;
      case UsersServiceError.UNKNOWN_ERROR:
        throw new InternalServerErrorException();
      default:
        return result;
    }
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List of users' })
  @UserListApiResponseOK()
  @ApiResponseUnauthorizedNotLoggedIn()
  async findAll() {
    const users = await this.usersService.findAll();
    return users;
  }

  @Get(userIdParam)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Find a user' })
  @ApiParam(UserIdParams.asApiParamOptions)
  @UserApiResponseOK()
  @ApiResponseUnauthorizedNotLoggedIn()
  @ApiResponseBadRequest()
  @ApiResponseNotFound()
  async findOne(@Param() { userId }: UserIdParams) {
    const user = await this.usersService.findOneById(userId);
    if (!user) throw new NotFoundException();
    return user;
  }

  @Put(userIdParam)
  @RestrictedByUserId()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a user' })
  @ApiParam(UserIdParams.asApiParamOptions)
  @UserApiResponseOK()
  @ApiResponseUnauthorizedNotLoggedIn()
  @ApiResponseBadRequest()
  @ApiResponseForbidden()
  @ApiResponseConflictEmailTaken()
  async update(
    @Param() { userId }: UserIdParams,
    @Body() dto: UpdateUserDto,
  ): Promise<User> {
    const result = await this.usersService.update(userId, dto);
    switch (result) {
      case UsersServiceError.EMAIL_ALREADY_IN_USE:
        throw EMAIL_ALREADY_IN_USE;
      case UsersServiceError.UNKNOWN_ERROR:
        throw new InternalServerErrorException();
      default:
        return result;
    }
  }

  @Delete(userIdParam)
  @HttpCode(HttpStatus.NO_CONTENT)
  @RestrictedByUserId()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a user' })
  @ApiParam(UserIdParams.asApiParamOptions)
  @ApiResponseNoContent()
  @ApiResponseUnauthorizedNotLoggedIn()
  @ApiResponseBadRequest()
  @ApiResponseNotFound()
  @ApiResponseForbidden()
  async delete(@Param() { userId }: UserIdParams) {
    let user = await this.usersService.findOneById(userId);
    if (!user) throw new NotFoundException();
    user = await this.usersService.delete(userId);
    if (!user) throw new NotFoundException();
  }
}
