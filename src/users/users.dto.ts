import { PartialType } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { PASSWORD_MIN_LENGTH } from 'src/common/constants';
import { EmailApiProperty, PasswordApiProperty } from 'src/common/swagger';

export class CreateUserDto {
  @EmailApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @PasswordApiProperty()
  @MinLength(PASSWORD_MIN_LENGTH)
  @IsNotEmpty()
  password: string;
}

export class UpdateUserDto
  extends PartialType(CreateUserDto)
  implements Partial<CreateUserDto> {}
