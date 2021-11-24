import type { snapshots } from '@pereslavtsev/webarchiver-protoc';
import { Snapshot } from '../models';
import { PickType } from '@nestjs/mapped-types';

export class GetSnapshotsDto
  extends PickType(Snapshot, ['taskId'] as const)
  implements snapshots.GetSnapshotsRequest {}
