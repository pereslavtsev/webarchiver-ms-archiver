import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Snapshot } from '../models';
import { InjectSnapshotsRepository } from '../snapshots.decorators';

@Injectable()
export class SnapshotsService {
  constructor(
    @InjectSnapshotsRepository()
    private snapshotsRepository: Repository<Snapshot>,
  ) {}

  create(uri: string, capturedAt: Date) {
    return this.snapshotsRepository.create({ uri, capturedAt });
  }
}
