import { Processor, Process, OnQueueActive } from '@nestjs/bull';
import type { Job } from 'bull';
import type { Task } from '@archiver/tasks';
import { TIMETRAVEL_QUEUE } from '../archiver.constants';
import { CoreProvider } from '@archiver/shared';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
import { ArchiverService } from '../services';

@Processor(TIMETRAVEL_QUEUE)
export class ArchiverConsumer extends CoreProvider {
  constructor(
    @RootLogger() rootLogger: Bunyan,
    private archiverService: ArchiverService,
  ) {
    super(rootLogger);
  }

  @OnQueueActive()
  onActive(job: Job) {
    console.log(
      `Processing job ${job.id} of type ${job.name} with data ${job.data}...`,
    );
  }

  @Process()
  async process(job: Job<Task>) {
    const log = this.log.child({ reqId: job.id });
    const { data } = job;
    try {
      log.debug('fetching mementos...');
      const snapshots = await this.archiverService.run(data);
      log.debug({ snapshots });
    } catch (error) {
      log.error(error);
      await job.moveToFailed({ message: (error as Error).message });
    }
  }
}
