import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber,
} from 'typeorm';
import { Snapshot } from './models';
import { CoreProvider } from '@archiver/shared';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';

@EventSubscriber()
export class SnapshotSubscriber
  extends CoreProvider
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
