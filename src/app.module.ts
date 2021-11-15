import { Module } from '@nestjs/common';
import { ArchiverModule } from '@archiver/archiver';
import { CheckerModule } from '@archiver/checker';
import { SharedModule } from '@archiver/shared';

@Module({
  imports: [ArchiverModule, CheckerModule, SharedModule],
})
export class AppModule {}
