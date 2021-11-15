import { InjectRepository } from '@nestjs/typeorm';
import { Snapshot } from './models';
import { OnEvent } from '@nestjs/event-emitter';

export function InjectSnapshotsRepository() {
  return InjectRepository(Snapshot);
}

export function OnSnapshotChecked() {
  return OnEvent('snapshot.checked');
}
