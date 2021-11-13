import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Snapshot } from '../models';
import { InjectSnapshotsRepository } from '../snapshots.decorators';
import { CoreProvider } from '@archiver/shared';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class SnapshotsService extends CoreProvider {
  constructor(
    @RootLogger() rootLogger: Bunyan,
    @InjectSnapshotsRepository()
    private snapshotsRepository: Repository<Snapshot>,
    private eventEmitter: EventEmitter2,
  ) {
    super(rootLogger);
  }

  create(uri: string, capturedAt: Date) {
    return this.snapshotsRepository.create({ uri, capturedAt });
  }

  findById(id: Snapshot['id']) {
    return this.snapshotsRepository.findOneOrFail(id);
  }

  private async setStatus(
    snapshotId: Snapshot['id'],
    status: Snapshot['status'],
  ) {
    const snapshot = await this.findById(snapshotId);
    return this.snapshotsRepository.save({
      ...snapshot,
      status,
    });
  }

  async cancelPending(task: Snapshot['task']): Promise<void> {
    await this.snapshotsRepository.update(
      { task, status: Snapshot.Status.PENDING },
      { status: Snapshot.Status.CANCELLED },
    );
  }

  async setChecked(snapshotId: Snapshot['id']): Promise<Snapshot> {
    const snapshot = await this.setStatus(snapshotId, Snapshot.Status.CHECKED);
    this.eventEmitter.emit('snapshot.checked', snapshot);
    return snapshot;
  }

  async setFailed(snapshotId: Snapshot['id']): Promise<Snapshot> {
    const snapshot = await this.setStatus(snapshotId, Snapshot.Status.FAILED);
    this.eventEmitter.emit('snapshot.failed', snapshot);
    return snapshot;
  }
}
