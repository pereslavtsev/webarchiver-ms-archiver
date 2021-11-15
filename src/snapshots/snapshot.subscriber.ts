import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber,
} from 'typeorm';
import { Snapshot } from './models';
import { LoggableProvider } from '@pereslavtsev/webarchiver-misc';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';

@EventSubscriber()
export class SnapshotSubscriber
  extends LoggableProvider
  implements EntitySubscriberInterface<Snapshot>
{
  constructor(@RootLogger() rootLogger: Bunyan, connection: Connection) {
    super(rootLogger);
    connection.subscribers.push(this);
  }

  listenTo() {
    return Snapshot;
  }
}
