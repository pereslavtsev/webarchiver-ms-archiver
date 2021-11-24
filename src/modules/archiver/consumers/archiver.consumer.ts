import {
  Processor,
  Process,
  OnQueueActive,
  OnQueueCompleted,
  OnQueueFailed,
} from '@nestjs/bull';
import type { Job } from 'bull';
import type { Task } from '@archiver/tasks';
import { TIMETRAVEL_QUEUE } from '../archiver.constants';
import { LoggableProvider } from '@pereslavtsev/webarchiver-misc';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
import { ArchiverService } from '../services';
import { TasksService } from '@archiver/tasks';
import { Snapshot } from '@archiver/snapshots';

@Processor(TIMETRAVEL_QUEUE)
export class ArchiverConsumer extends LoggableProvider {
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
    log.debug(
      `fetching mementos for uri ${data.url} on ${new Date(
        data.desiredDate,
      ).toLocaleDateString()}...`,
    );
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

  @OnQueueFailed()
  async handleFailed(job: Job<Task>, err: Error) {
    const { data: task } = job;
    const log = this.log.child({ reqId: job.id });
    log.error(err);
    await this.tasksService.setFailed(task.id);
  }

  @Process()
  async process(job: Job<Task>) {
    const log = this.log.child({ reqId: job.id });
    const { data: task } = job;
    log.debug(`processing task...`);
    return this.archiverService.run(task);
  }
}
