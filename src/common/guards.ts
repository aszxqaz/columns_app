import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { UserRole } from '@prisma/client';
import { Observable } from 'rxjs';
import { Requestor } from 'src/users/users.service';
import { RestrictedByUserIdMetadataKey } from './decorators';

@Injectable()
export class AuthenticationGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    return super.canActivate(context);
  }
}

@Injectable()
export class RestrictedByUserIdGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    let isRestricted =
      this.reflector.get<boolean>(
        RestrictedByUserIdMetadataKey,
        context.getHandler(),
      ) ||
      this.reflector.get<boolean>(
        RestrictedByUserIdMetadataKey,
        context.getClass(),
      );

    if (!isRestricted) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user as Requestor;

    if (!user) throw new UnauthorizedException();

    if (user.role === UserRole.admin) return true;

    if (request.params['userId'] == user.id) return true;

    throw new ForbiddenException();
  }
}
