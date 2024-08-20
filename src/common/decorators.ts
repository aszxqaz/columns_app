import {
  ExecutionContext,
  SetMetadata,
  createParamDecorator,
} from '@nestjs/common';
import { Requestor } from 'src/users/users.service';

export const Public = () => SetMetadata('isPublic', true);

export const RequestorParam = createParamDecorator(
  (data: keyof Requestor | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    if (!data) return request.user;
    return request.user[data];
  },
);

export const RestrictedByUserIdMetadataKey = 'RestrictedByUserIdMetadataKey';
export const RestrictedByUserId = () =>
  SetMetadata(RestrictedByUserIdMetadataKey, true);
