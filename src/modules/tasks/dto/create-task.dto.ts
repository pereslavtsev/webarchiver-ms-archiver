import { PickType } from '@nestjs/mapped-types';
import { Task } from '../models';
import { archiver, toDate } from '@pereslavtsev/webarchiver-protoc';
import { Transform } from 'class-transformer';

export class CreateTaskDto
  extends PickType(Task, ['url', 'quote', 'status', 'desiredDate'] as const)
  implements archiver.CreateArchiverTaskRequest
{
  @Transform(({ value }) => toDate(value))
  desiredDate: Date;
}
