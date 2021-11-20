import { PickType } from '@nestjs/mapped-types';
import { Task } from '../models';
import { archiver, toDate } from '@webarchiver/protoc';
import { Transform } from 'class-transformer';

export class CreateTaskDto
  extends PickType(Task, ['url', 'quote', 'status', 'desiredDate'] as const)
  implements archiver.v1.CreateTaskRequest
{
  @Transform(({ value }) => toDate(value))
  desiredDate: Date;
}
