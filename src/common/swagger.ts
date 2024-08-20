import { HttpStatus, Type } from '@nestjs/common';
import { ApiProperty, ApiResponse } from '@nestjs/swagger';

export const UserIdApiProperty = () =>
  ApiProperty({
    type: Number,
    example: 42,
    description: 'user id',
  });

export const EmailApiProperty = () =>
  ApiProperty({
    type: String,
    example: 'example@email.com',
    description: 'User email',
  });

export const PasswordApiProperty = () =>
  ApiProperty({
    type: String,
    example: 'password123',
    minLength: 6,
    description: 'User password',
  });

export const TypedApiResponse =
  (status: number) =>
  (type?: string | Function | Type<unknown> | [Function]) =>
  () =>
    ApiResponse({
      status,
      description: 'Success',
      type,
    });

export const TypedApiResponseOK = TypedApiResponse(HttpStatus.OK);
export const TypedApiResponseCreated = TypedApiResponse(HttpStatus.CREATED);
export const ApiResponseNoContent = TypedApiResponse(HttpStatus.NO_CONTENT)();

export const ApiResponseForbidden = () =>
  ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'No permission for this operation',
  });

export const ApiResponseUnauthorized = (description: string) =>
  ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description,
  });

export const ApiResponseUnauthorizedInvalidCredentials = () =>
  ApiResponseUnauthorized('Invalid email or password');

export const ApiResponseUnauthorizedNotLoggedIn = () =>
  ApiResponseUnauthorized('User not logged in');

export const ApiResponseNotFound = () =>
  ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Resource not found',
  });

export const ApiResponseBadRequest = () =>
  ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request',
  });

export const ApiResponseConflict = (description: string) =>
  ApiResponse({
    status: HttpStatus.CONFLICT,
    description,
  });

export const ApiResponseConflictEmailTaken = () =>
  ApiResponseConflict('Email already taken');
