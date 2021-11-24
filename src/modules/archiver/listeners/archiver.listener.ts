import { Injectable } from '@nestjs/common';
import { OnTask, TasksService } from '@archiver/tasks';
import type { Task } from '@archiver/tasks';
import { InjectQueue } from '@nestjs/bull';
import { TIMETRAVEL_QUEUE } from '../archiver.constants';
import { Queue } from 'bull';
import { LoggableProvider } from '@pereslavtsev/webarchiver-misc';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
import { OnSnapshot, Snapshot, SnapshotsService } from '@archiver/snapshots';

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

  @OnTask.Created()
  async handleTaskCreatedEvent(task: Task): Promise<void> {
    await this.timetravelQueue.add(task, {
      jobId: task.id,
    });
  }

  @OnSnapshot.Checked()
  async handleSnapshotCheckedEvent({ id }: Snapshot): Promise<void> {
    const snapshot = await this.snapshotsService.findById(id);
    const task = await snapshot.task;
    await this.snapshotsService.cancelPending(task);
    await this.tasksService.setDone(task.id);
  }
}
