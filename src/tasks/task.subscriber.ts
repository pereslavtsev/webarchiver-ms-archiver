import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber,
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
}
