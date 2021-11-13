import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { CHECKER_QUEUE } from '../checker.constants';
import { CoreProvider } from '@archiver/shared';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
import { OnSnapshotsReceived, Task } from '@archiver/tasks';

@Injectable()
export class CheckerListener extends CoreProvider {
  constructor(
    @RootLogger() rootLogger: Bunyan,
    @InjectQueue(CHECKER_QUEUE)
    private checkerQueue: Queue<Task>,
  ) {
    super(rootLogger);
  }

  @OnSnapshotsReceived()
  async handleSnapshotCreatedEvent(task: Task) {
    await this.checkerQueue.add(task, {
      jobId: task.id,
    });
  }
}
