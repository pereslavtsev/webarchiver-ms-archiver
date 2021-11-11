import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './models';

export function InjectTasksRepository() {
  return InjectRepository(Task);
}
