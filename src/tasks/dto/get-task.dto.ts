import type { archiver } from '@webarchiver/protoc';
import { Task } from '../models';
import { PickType } from '@nestjs/mapped-types';

export class GetTaskDto
  extends PickType(Task, ['id'] as const)
  implements archiver.v1.GetTaskRequest {}
