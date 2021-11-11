import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';
import { Task } from './models';

@EventSubscriber()
export class TaskSubscriber implements EntitySubscriberInterface<Task> {
  constructor(connection: Connection) {
    connection.subscribers.push(this);
  }

  listenTo() {
    return Task;
  }

  beforeInsert(event: InsertEvent<Task>) {
    console.log(`BEFORE USER INSERTED: `, event.entity);
  }
}
