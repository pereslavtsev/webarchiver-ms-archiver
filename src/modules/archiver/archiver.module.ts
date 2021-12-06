import { Module } from '@nestjs/common';
import { MementoModule } from '../memento';
import { BullModule } from '@nestjs/bull';
import { ArchiverController } from './controllers';
import { ARCHIVE_ORG_QUEUE, TIMETRAVEL_QUEUE } from './archiver.constants';
import * as services from './services';
import { ArchiverListener } from './listeners';
import * as consumers from './consumers';
import { TasksModule } from '@archiver/tasks';
import { SnapshotsModule } from '@archiver/snapshots';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule,
    MementoModule.forRoot({
      baseURL: 'https://timetravel.mementoweb.org',
      timeout: 3 * 60 * 1000,
    }),
    BullModule.registerQueueAsync(
      {
        name: ARCHIVE_ORG_QUEUE,
      },
      {
        name: TIMETRAVEL_QUEUE,
      },
    ),
    TasksModule,
    SnapshotsModule,
  ],
  controllers: [ArchiverController],
  providers: [
    ...Object.values(services),
    ArchiverListener,
    ...Object.values(consumers),
  ],
})
export class ArchiverModule {}
