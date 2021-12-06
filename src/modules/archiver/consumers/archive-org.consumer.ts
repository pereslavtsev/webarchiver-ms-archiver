import {
  OnQueueActive,
  OnQueueCompleted,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull';
import { ARCHIVE_ORG_QUEUE } from '../archiver.constants';
import { LoggableProvider } from '@pereslavtsev/webarchiver-misc';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
import { ArchiveOrgService, TimetravelService } from '../services';
import { Task, TasksService } from '@archiver/tasks';
import { Job } from 'bull';
import { Snapshot, SnapshotsService } from '@archiver/snapshots';
import { DateTime } from 'luxon';

@Processor(ARCHIVE_ORG_QUEUE)
export class ArchiveOrgConsumer extends LoggableProvider {
  constructor(
    @RootLogger() rootLogger: Bunyan,
    private archiveOrgService: ArchiveOrgService,
    private timetravelService: TimetravelService,
    private tasksService: TasksService,
    private snapshotsService: SnapshotsService,
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

  @Process({ concurrency: 10 })
  async process(job: Job<Task>) {
    const log = this.log.child({ reqId: job.id });
    const { data: task } = job;
    const { url, desiredDate } = task;
    log.debug(`processing task...`);
    const { url: snapshotUrl, timestamp } =
      await this.archiveOrgService.findClosest(url, desiredDate);
    return this.tasksService.addSnapshots(task.id, [
      this.snapshotsService.create(snapshotUrl, timestamp, task.id),
    ]);
  }
}
