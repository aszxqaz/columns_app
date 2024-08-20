import { MorganMiddleware } from '@nest-middlewares/morgan';
import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, RouterModule } from '@nestjs/core';
import { CardsModule } from './cards/cards.module';
import { ColumnsModule } from './columns/columns.module';
import { CommentsModule } from './comments/comments.module';
import { AuthenticationGuard, RestrictedByUserIdGuard } from './common/guards';
import { defaultMorganFn } from './common/morgan';
import { AccessTokenStrategy } from './common/strategy';
import { PasswordModule } from './password/password.module';
import { PrismaModule } from './prisma/prisma.module';
import { TokensModule } from './tokens/tokens.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV?.toLowerCase()}`,
      isGlobal: true,
    }),
    PrismaModule,
    UsersModule,
    TokensModule,
    PasswordModule,
    ColumnsModule,
    RouterModule.register([
      {
        path: 'users',
        module: UsersModule,
        children: [
          {
            path: '/:userId/columns',
            module: ColumnsModule,
            children: [
              {
                path: '/:columnId/cards',
                module: CardsModule,
                children: [
                  {
                    path: '/:cardId/comments',
                    module: CommentsModule,
                  },
                ],
              },
            ],
          },
        ],
      },
    ]),
    CardsModule,
    CommentsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RestrictedByUserIdGuard,
    },
    AccessTokenStrategy,
  ],
})
export class AppModule implements NestModule {
  private reqLogger = new Logger('RequestLogger');

  configure(consumer: MiddlewareConsumer) {
    MorganMiddleware.configure(defaultMorganFn, {
      stream: { write: this.reqLogger.log.bind(this.reqLogger) },
    });
    consumer.apply(MorganMiddleware).forRoutes('*');
  }
}
