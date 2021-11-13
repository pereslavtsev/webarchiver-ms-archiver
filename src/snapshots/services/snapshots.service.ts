import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Snapshot } from '../models';
import { InjectSnapshotsRepository } from '../snapshots.decorators';
import { CoreProvider } from '@archiver/shared';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';

@Injectable()
export class SnapshotsService extends CoreProvider {
  constructor(
    @RootLogger() rootLogger: Bunyan,
    @InjectSnapshotsRepository()
    private snapshotsRepository: Repository<Snapshot>,
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

  setChecked(snapshotId: Snapshot['id']) {
    return this.setStatus(snapshotId, Snapshot.Status.CHECKED);
  }

  setFailed(snapshotId: Snapshot['id']) {
    return this.setStatus(snapshotId, Snapshot.Status.FAILED);
  }
}
