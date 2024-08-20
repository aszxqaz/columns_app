import {
  BadRequestException,
  ValidationPipe,
  ValidationPipeOptions,
} from '@nestjs/common';

export class DefaultValidationPipe extends ValidationPipe {
  constructor(options?: ValidationPipeOptions) {
    super({
      transform: true,
      whitelist: true,
      stopAtFirstError: true,
      exceptionFactory(errors) {
        const errorMessages = errors.map((error) => ({
          field: error.property,
          value: error.value,
          message: error.constraints[Object.keys(error.constraints)[0]],
        }));
        return new BadRequestException(errorMessages);
      },
      ...options,
    });
  }
}
