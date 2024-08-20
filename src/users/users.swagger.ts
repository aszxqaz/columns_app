import { HttpStatus } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { User as UserModel } from '@prisma/client';
import { EmailApiProperty, UserIdApiProperty } from 'src/common/swagger';

class User implements UserModel {
  @UserIdApiProperty()
  id: number;

  @EmailApiProperty()
  email: string;
}

export const UserApiResponseOK = () =>
  ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: User,
  });

export const UserApiResponseCreated = () =>
  ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Success',
    type: User,
  });

export const UserListApiResponseOK = () =>
  ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: [User],
  });
