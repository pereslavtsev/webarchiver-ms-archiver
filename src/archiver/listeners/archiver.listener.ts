import { Injectable } from '@nestjs/common';
import { OnTaskCreated, TasksService } from '@archiver/tasks';
import type { Task } from '@archiver/tasks';
import { InjectQueue } from '@nestjs/bull';
import { TIMETRAVEL_QUEUE } from '../archiver.constants';
import { Queue } from 'bull';
import { LoggableProvider } from '@pereslavtsev/webarchiver-misc';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
import {
  OnSnapshotChecked,
  Snapshot,
  SnapshotsService,
} from '@archiver/snapshots';

@Injectable()
export class ArchiverListener extends LoggableProvider {
  constructor(
    @RootLogger() rootLogger: Bunyan,
    @InjectQueue(TIMETRAVEL_QUEUE)
    private timetravelQueue: Queue<Task>,
    private snapshotsService: SnapshotsService,
    private tasksService: TasksService,
  ) {
    super(rootLogger);
  }

  @OnTaskCreated()
  async handleTaskCreatedEvent(task: Task) {
    await this.timetravelQueue.add(task, {
      jobId: task.id,
    });
  }

  @OnSnapshotChecked()
  async handleSnapshotCheckedEvent({ id }: Snapshot) {
    const snapshot = await this.snapshotsService.findById(id);
    const task = await snapshot.task;
    await this.snapshotsService.cancelPending(task);
    await this.tasksService.setDone(task.id);
  }
}
