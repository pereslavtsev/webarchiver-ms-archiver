import type { archiver } from '@webarchiver/protoc';
import { Max, Min } from 'class-validator';

export class ListTasksDto implements archiver.ListTasksRequest {
  @Min(1)
  @Max(50)
  readonly pageSize: number;

  readonly pageToken: string;

  readonly orderBy: string;
}
