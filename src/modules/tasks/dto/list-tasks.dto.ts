import type { archiver } from '@pereslavtsev/webarchiver-protoc';
import { Max, Min } from 'class-validator';

export class ListTasksDto implements archiver.ListArchiverTasksRequest {
  @Min(1)
  @Max(50)
  readonly pageSize: number;

  readonly pageToken: string;

  readonly orderBy: string;
}
