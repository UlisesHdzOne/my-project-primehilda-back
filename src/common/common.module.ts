import { Global, Module } from '@nestjs/common';
import { ResponseInterceptor } from './interceptors/response.interceptor';
import { GlobalExceptionFilter } from './filters/http-exception.filter';
import { AppLogger } from '../core/logger/winston.config';
import { ErrorUtilsService } from './utils/error-utils.service';

@Global()
@Module({
  providers: [
    AppLogger,
    ErrorUtilsService,
    {
      provide: 'APP_INTERCEPTOR',
      useClass: ResponseInterceptor,
    },
    {
      provide: 'APP_FILTER',
      useClass: GlobalExceptionFilter,
    },
  ],
  exports: [AppLogger, ErrorUtilsService],
})
export class CommonModule {}
