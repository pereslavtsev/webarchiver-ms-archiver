import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';
import { Task } from './models';
import { EventEmitter2 } from '@nestjs/event-emitter';

@EventSubscriber()
export class TaskSubscriber implements EntitySubscriberInterface<Task> {
  constructor(connection: Connection, private eventEmitter: EventEmitter2) {
    connection.subscribers.push(this);
  }

  listenTo() {
    return Task;
  }

  afterInsert(event: InsertEvent<Task>) {
    this.eventEmitter.emit('task.created', event.entity);
  }
}
