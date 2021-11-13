import { Module } from '@nestjs/common';
import { ArchiverModule } from '@archiver/archiver';
import { CheckerModule } from './checker/checker.module';
import { SharedModule } from './shared';

@Module({
  imports: [ArchiverModule, CheckerModule, SharedModule],
})
export class AppModule {}
