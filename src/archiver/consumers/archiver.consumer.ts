import {
  Processor,
  Process,
  OnQueueActive,
  OnQueueCompleted,
} from '@nestjs/bull';
import type { Job } from 'bull';
import type { Task } from '@archiver/tasks';
import { TIMETRAVEL_QUEUE } from '../archiver.constants';
import { CoreProvider } from '@archiver/shared';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
import { ArchiverService } from '../services';
import { TasksService } from '@archiver/tasks';
import { Snapshot } from '@archiver/snapshots';

@Processor(TIMETRAVEL_QUEUE)
export class ArchiverConsumer extends CoreProvider {
  constructor(
    @RootLogger() rootLogger: Bunyan,
    private archiverService: ArchiverService,
    private tasksService: TasksService,
  ) {
    super(rootLogger);
  }

  @OnQueueActive()
  async onActive(job: Job<Task>) {
    const log = this.log.child({ reqId: job.id });
    const { data } = job;
    log.debug(`fetching mementos for uri ${data.url}...`);
    await this.tasksService.setInProgress(data.id);
  }

  @OnQueueCompleted()
  onCompleted(job: Job<Task>, snapshots: Snapshot[]) {
    const log = this.log.child({ reqId: job.id });
    const { data } = job;
    log.debug(
      snapshots.map(({ uri }) => uri),
      `snapshots received for url ${data.url}`,
    );
  }

  @Process()
  async process(job: Job<Task>) {
    const log = this.log.child({ reqId: job.id });
    const { data } = job;
    try {
      return this.archiverService.run(data);
    } catch (error) {
      log.error(error);
      await Promise.all([
        this.tasksService.setFailed(data.id),
        job.moveToFailed({ message: (error as Error).message }),
      ]);
    }
  }
}
