import { Module } from '@nestjs/common';
import { MementoModule } from '../memento';
import { BullModule } from '@nestjs/bull';
import { ArchiverController } from './controllers';
import { TIMETRAVEL_QUEUE } from './archiver.constants';
import { ArchiverService } from './services';

@Module({
  imports: [
    MementoModule.forRoot('https://timetravel.mementoweb.org'),
    BullModule.registerQueue({
      name: TIMETRAVEL_QUEUE,
    }),
  ],
  controllers: [ArchiverController],
  providers: [ArchiverService],
})
export class ArchiverModule {}
