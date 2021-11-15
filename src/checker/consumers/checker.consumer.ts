import { CHECKER_QUEUE } from '../checker.constants';
import {
  OnQueueCompleted,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull';
import { LoggableProvider } from '@pereslavtsev/webarchiver-misc';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
import { Job } from 'bull';
import { CheckerService } from '../services';
import { Task, TasksService } from '@archiver/tasks';
import { Snapshot, SnapshotsService } from '@archiver/snapshots';

@Processor(CHECKER_QUEUE)
export class CheckerConsumer extends LoggableProvider {
  constructor(
    @RootLogger() rootLogger: Bunyan,
    private checkerService: CheckerService,
    private snapshotsService: SnapshotsService,
    private tasksService: TasksService,
  ) {
    super(rootLogger);
  }

  @OnQueueCompleted()
  async onCompleted(job: Job<Task>, snapshot: Snapshot) {
    const log = this.log.child({ reqId: job.id });
    const { data } = job;
    log.debug(
      `snapshot ${snapshot.uri} successfully checked for url ${data.url}, marking as checked...`,
    );
    const checked = await this.snapshotsService.setChecked(snapshot.id);
    log.debug({ checked }, 'checked snapshot');
  }

  @OnQueueFailed()
  async handleFailed(job: Job<Task>, err: Error) {
    const log = this.log.child({ reqId: job.id });
    const { data } = job;
    log.error(err);
    const failed = await this.tasksService.setFailed(data.id);
    log.debug({ failed }, 'failed task');
  }

  @Process()
  async process(job: Job<Task>) {
    const {
      data: { snapshots, quote, url },
    } = job;
    const log = this.log.child({ reqId: job.id });
    for (let i = 0; i < snapshots.length; i++) {
      log.debug(
        `checking snapshot (${i + 1}/${snapshots.length}) ${
          snapshots[i].uri
        }...`,
      );
      const checked = await this.checkerService.checkSnapshot(
        snapshots[i],
        quote,
      );
      if (checked) {
        return snapshots[i];
      }
      await this.snapshotsService.setFailed(snapshots[i].id);
    }
    throw new Error(`No checked snapshots for url ${url} was found`);
  }
}
