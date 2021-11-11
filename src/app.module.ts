import { Module } from '@nestjs/common';
import { ArchiverModule } from '@archiver/archiver';
import { CheckerModule } from './checker/checker.module';
import { SharedModule } from './shared';
import { TasksModule } from '@archiver/tasks';

@Module({
  imports: [ArchiverModule, CheckerModule, SharedModule, TasksModule],
})
export class AppModule {}
