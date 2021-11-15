import type { archiver } from '@webarchiver/protoc';
import { Max, Min } from 'class-validator';

export class ListTasksDto implements archiver.v1.ListTasksRequest {
  @Min(1)
  @Max(50)
  readonly pageSize: number;

  readonly pageToken: string;

  readonly orderBy: string;
}
