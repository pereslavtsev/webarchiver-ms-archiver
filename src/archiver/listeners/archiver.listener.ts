import { Injectable } from '@nestjs/common';
import { OnTaskCreated } from '@archiver/tasks';
import type { Task } from '@archiver/tasks';
import { InjectQueue } from '@nestjs/bull';
import { TIMETRAVEL_QUEUE } from '../archiver.constants';
import { Queue } from 'bull';

@Injectable()
export class ArchiverListener {
  constructor(
    @InjectQueue(TIMETRAVEL_QUEUE)
    private timetravelQueue: Queue<Task>,
  ) {}

  @OnTaskCreated()
  async handleTaskCreatedEvent(task: Task) {
    await this.timetravelQueue.add(task, {
      jobId: task.id,
    });
  }
}
