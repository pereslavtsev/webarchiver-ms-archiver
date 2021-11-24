import type { Repository } from 'typeorm';
import type { Task } from './models';

export type TasksRepository = Repository<Task>;
