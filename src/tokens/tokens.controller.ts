import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators';
import { ApiResponseUnauthorizedInvalidCredentials } from 'src/common/swagger';
import { PasswordService } from 'src/password/password.service';
import { UserService } from 'src/users/users.service';
import { CreateAuthenticationTokenDto } from './tokens.dto';
import { TokenService } from './tokens.service';
import {
  AuthenticationToken,
  AuthTokenApiResponseCreated,
} from './tokens.swagger';

const UNAUTHORZIED_EXCEPTION = new UnauthorizedException(
  'Invalid email or password',
);

@ApiTags('Tokens')
@Controller('tokens')
export class TokensController {
  constructor(
    private readonly tokenService: TokenService,
    private readonly passwordService: PasswordService,
    private readonly userService: UserService,
  ) {}

  @Public()
  @Post('auth')
  @ApiOperation({
    summary: 'Obtain an authentication token',
  })
  @AuthTokenApiResponseCreated()
  @ApiResponseUnauthorizedInvalidCredentials()
  @ApiBadRequestResponse()
  async createAuthenticationToken(
    @Body() dto: CreateAuthenticationTokenDto,
  ): Promise<AuthenticationToken> {
    const { email, password } = dto;
    const user = await this.userService.findOneByEmailInternal(email);
    if (!user) throw UNAUTHORZIED_EXCEPTION;

    const isPasswordValid = await this.passwordService.verify(
      user.internalUser.passwordHash,
      password,
    );
    if (!isPasswordValid) throw UNAUTHORZIED_EXCEPTION;

    const token = await this.tokenService.createAuthToken({
      userId: user.id,
    });

    return { token };
  }
}
