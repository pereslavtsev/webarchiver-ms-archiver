import { InjectRepository } from '@nestjs/typeorm';
import { Snapshot } from './models';

export function InjectSnapshotsRepository() {
  return InjectRepository(Snapshot);
}
