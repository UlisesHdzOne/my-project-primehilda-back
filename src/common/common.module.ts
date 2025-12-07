import { Global, Module } from '@nestjs/common';
import { ResponseInterceptor } from './interceptors/response.interceptor';
import { GlobalExceptionFilter } from './filters/http-exception.filter';
import { AppLogger } from './logger/winston.config';

@Global()
@Module({
  providers: [
    AppLogger,
    {
      provide: 'APP_INTERCEPTOR',
      useClass: ResponseInterceptor,
    },
    {
      provide: 'APP_FILTER',
      useClass: GlobalExceptionFilter,
    },
  ],
  exports: [AppLogger],
})
export class CommonModule {}
