import { Injectable } from '@nestjs/common';
import { OnTaskCreated } from '@archiver/tasks';
import type { Task } from '@archiver/tasks';
import { InjectQueue } from '@nestjs/bull';
import { TIMETRAVEL_QUEUE } from '../archiver.constants';
import { Queue } from 'bull';
import { CoreProvider } from '@archiver/shared';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';

@Injectable()
export class ArchiverListener extends CoreProvider {
  constructor(
    @RootLogger() rootLogger: Bunyan,
    @InjectQueue(TIMETRAVEL_QUEUE)
    private timetravelQueue: Queue<Task>,
  ) {
    super(rootLogger);
  }

  @OnTaskCreated()
  async handleTaskCreatedEvent(task: Task) {
    await this.timetravelQueue.add(task, {
      jobId: task.id,
    });
  }
}
