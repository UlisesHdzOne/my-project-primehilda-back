import { Global, Module } from '@nestjs/common';
import {
  withDatabaseErrorHandling,
  validateOrThrow,
  checkConflict,
} from '@/common/utils/error.utils';

@Global()
@Module({
  providers: [
    // Exportamos las funciones como providers inyectables
    {
      provide: 'ErrorUtils',
      useValue: { withDatabaseErrorHandling, validateOrThrow, checkConflict },
    },
  ],
  exports: ['ErrorUtils'],
})
export class SharedModule {}
