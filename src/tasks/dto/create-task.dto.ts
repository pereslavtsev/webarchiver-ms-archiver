import { PickType } from '@nestjs/mapped-types';
import { Task } from '../models';
import type { archiver } from '@webarchiver/protoc';

export class CreateTaskDto
  extends PickType(Task, ['url', 'quote', 'status', 'desiredDate'] as const)
  implements archiver.CreateTaskRequest {}
