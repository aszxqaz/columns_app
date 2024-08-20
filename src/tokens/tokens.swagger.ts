import { ApiProperty } from '@nestjs/swagger';
import { TypedApiResponseCreated } from 'src/common/swagger';

export class AuthenticationToken {
  @ApiProperty({
    type: String,
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpvaG4iOiAiUFJPTlJFRiIsInR5cCI6IkpvaG4iOiAiU2VjcmV0IjpbMjAxNiI6MDAiMCJ9',
    description: 'Authentication bearer token',
  })
  token: string;
}

export const AuthTokenApiResponseCreated =
  TypedApiResponseCreated(AuthenticationToken);
