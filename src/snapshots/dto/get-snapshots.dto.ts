import type { archiver } from '@webarchiver/protoc';
import { Snapshot } from '../models';
import { PickType } from '@nestjs/mapped-types';

export class GetSnapshotsDto
  extends PickType(Snapshot, ['taskId'] as const)
  implements archiver.v1.GetSnapshotsRequest {}
