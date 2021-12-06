import { Injectable } from '@nestjs/common';
import { OnTask, TasksService } from '@archiver/tasks';
import type { Task } from '@archiver/tasks';
import { InjectQueue } from '@nestjs/bull';
import { ARCHIVE_ORG_QUEUE, TIMETRAVEL_QUEUE } from '../archiver.constants';
import { Queue } from 'bull';
import { LoggableProvider } from '@pereslavtsev/webarchiver-misc';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
import { OnSnapshot, Snapshot, SnapshotsService } from '@archiver/snapshots';

@Injectable()
export class ArchiverListener extends LoggableProvider {
  constructor(
    @RootLogger() rootLogger: Bunyan,
    @InjectQueue(ARCHIVE_ORG_QUEUE)
    private archiveOrgQueue: Queue<Task>,
    @InjectQueue(TIMETRAVEL_QUEUE)
    private timetravelQueue: Queue<Task>,
    private snapshotsService: SnapshotsService,
    private tasksService: TasksService,
  ) {
    super(rootLogger);
  }

  @OnTask.Created()
  async handleTaskCreatedEvent(task: Task): Promise<void> {
    await this.archiveOrgQueue.add(task, {
      jobId: task.id,
    });
    // await this.timetravelQueue.add(task, {
    //   jobId: task.id,
    // });
  }

  @OnSnapshot.Checked()
  async handleSnapshotCheckedEvent({ id }: Snapshot): Promise<void> {
    const snapshot = await this.snapshotsService.findById(id);
    const task = await snapshot.task;
    await this.snapshotsService.cancelPending(task);
    await this.tasksService.setDone(task.id);
  }
}
