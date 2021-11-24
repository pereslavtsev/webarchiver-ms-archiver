import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { CHECKER_QUEUE } from './checker.constants';
import { PuppeteerModule } from 'nest-puppeteer';
import { CheckerConsumer } from './consumers';
import { CheckerService } from './services';
import { CheckerListener } from './listeners';
import { SnapshotsModule } from '@archiver/snapshots';
import { TasksModule } from '@archiver/tasks';

@Module({
  imports: [
    PuppeteerModule.forRoot(),
    BullModule.registerQueue({
      name: CHECKER_QUEUE,
    }),
    TasksModule,
    SnapshotsModule,
  ],
  providers: [CheckerConsumer, CheckerListener, CheckerService],
  exports: [CheckerService],
})
export class CheckerModule {}
