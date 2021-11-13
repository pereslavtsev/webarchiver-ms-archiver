import { PickType } from '@nestjs/mapped-types';
import { Task } from '../models';
import type { CreateTaskRequest } from '@webarchiver/protoc/dist/archiver';

export class CreateTaskDto
  extends PickType(Task, ['url', 'quote', 'status', 'desiredDate'] as const)
  implements CreateTaskRequest {}
