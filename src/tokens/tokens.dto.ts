import { IsEmail, IsNotEmpty } from 'class-validator';
import { EmailApiProperty, PasswordApiProperty } from 'src/common/swagger';

export class CreateAuthenticationTokenDto {
  @EmailApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @PasswordApiProperty()
  @IsNotEmpty()
  password: string;
}
