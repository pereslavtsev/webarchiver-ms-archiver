import type { ListTasksRequest } from '@webarchiver/protoc/dist/archiver';
import { Max, Min } from 'class-validator';

export class ListTasksDto implements ListTasksRequest {
  @Min(1)
  @Max(50)
  readonly pageSize: number;

  readonly pageToken: string;

  readonly orderBy: string;
}
