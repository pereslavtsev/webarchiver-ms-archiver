import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './models';
import { OnEvent } from '@nestjs/event-emitter';

export function InjectTasksRepository() {
  return InjectRepository(Task);
}

export class OnTask {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected constructor() {}

  protected static createDecorator(event: string) {
    return OnEvent(`task.${event}`);
  }

  static Created() {
    return OnTask.createDecorator('created');
  }

  static Done() {
    return OnTask.createDecorator('done');
  }
}

export function OnSnapshotsReceived() {
  return OnEvent('snapshots.received');
}
