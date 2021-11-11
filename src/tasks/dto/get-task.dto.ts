import type { GetTaskRequest } from '@webarchiver/protoc/dist/archiver';
import { Task } from '../models';
import { PickType } from '@nestjs/mapped-types';

export class GetTaskDto
  extends PickType(Task, ['id'] as const)
  implements GetTaskRequest {}
