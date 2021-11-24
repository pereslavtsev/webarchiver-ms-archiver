import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Snapshot } from '../models';
import { InjectSnapshotsRepository } from '../snapshots.decorators';
import { LoggableProvider } from '@pereslavtsev/webarchiver-misc';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { plainToClass } from 'class-transformer';
import { Task } from '@archiver/tasks';

@Injectable()
export class SnapshotsService extends LoggableProvider {
  constructor(
    @RootLogger() rootLogger: Bunyan,
    @InjectSnapshotsRepository()
    private snapshotsRepository: Repository<Snapshot>,
    private eventEmitter: EventEmitter2,
  ) {
    super(rootLogger);
  }

  create(uri: string, capturedAt: Date): Snapshot {
    const snapshot = this.snapshotsRepository.create({ uri, capturedAt });
    return plainToClass(Snapshot, snapshot);
  }

  async findById(id: Snapshot['id']): Promise<Snapshot> {
    const snapshot = await this.snapshotsRepository.findOneOrFail(id);
    return plainToClass(Snapshot, snapshot);
  }

  async findByTaskId(taskId: Task['id']) {
    const snapshots = await this.snapshotsRepository.find({
      where: {
        taskId,
      },
    });
    return plainToClass(Snapshot, snapshots);
  }

  private async setStatus(
    snapshotId: Snapshot['id'],
    status: Snapshot['status'],
  ): Promise<Snapshot> {
    const snapshot = await this.findById(snapshotId);
    const updatedSnapshot = await this.snapshotsRepository.save({
      ...snapshot,
      status,
    });
    return plainToClass(Snapshot, updatedSnapshot);
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
