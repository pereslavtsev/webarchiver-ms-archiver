import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './models';
import { OnEvent } from '@nestjs/event-emitter';

export function InjectTasksRepository() {
  return InjectRepository(Task);
}

export function OnTaskCreated() {
  return OnEvent('task.created');
}

export function OnTaskDone() {
  return OnEvent('task.done');
}

export function OnSnapshotsReceived() {
  return OnEvent('snapshots.received');
}
