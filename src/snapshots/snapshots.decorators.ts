import { InjectRepository } from '@nestjs/typeorm';
import { Snapshot } from './models';
import { OnEvent } from '@nestjs/event-emitter';

export function InjectSnapshotsRepository() {
  return InjectRepository(Snapshot);
}

export class OnSnapshot {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected constructor() {}

  static Checked() {
    return OnEvent('snapshot.checked');
  }
}
