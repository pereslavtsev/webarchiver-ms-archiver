import { Module } from '@nestjs/common';
import { MementoModule } from '../memento';
import { BullModule } from '@nestjs/bull';
import { ArchiverController } from './controllers';
import { TIMETRAVEL_QUEUE } from './archiver.constants';
import { ArchiverService } from './services';
import { ArchiverListener } from './listeners';
import { ArchiverConsumer } from './consumers';
import { TasksModule } from '@archiver/tasks';
import { SnapshotsModule } from '@archiver/snapshots';

@Module({
  imports: [
    MementoModule.forRoot({
      baseURL: 'https://timetravel.mementoweb.org',
      timeout: 3 * 60 * 1000,
    }),
    BullModule.registerQueue({
      name: TIMETRAVEL_QUEUE,
    }),
    TasksModule,
    SnapshotsModule,
  ],
  controllers: [ArchiverController],
  providers: [ArchiverService, ArchiverListener, ArchiverConsumer],
  exports: [ArchiverService],
})
export class ArchiverModule {}
