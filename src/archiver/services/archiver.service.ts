import { Injectable } from '@nestjs/common';
import { InjectMementoClient } from '@archiver/memento';
import type MementoClient from '@mementoweb/client';
import type { Task } from '@archiver/tasks';
import { TasksService } from '@archiver/tasks';
import type { MementosResponse } from '@mementoweb/client/lib/classes';
import { Snapshot, SnapshotsService } from '@archiver/snapshots';
import { CoreProvider } from '@archiver/shared';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';

@Injectable()
export class ArchiverService extends CoreProvider {
  constructor(
    @RootLogger() rootLogger: Bunyan,
    @InjectMementoClient()
    private client: MementoClient,
    private tasksService: TasksService,
    private snapshotsService: SnapshotsService,
  ) {
    super(rootLogger);
  }

  private transformSnapshots(
    response: MementosResponse['mementos']['closest'],
  ): Snapshot[] {
    return response.uri.map((uri) =>
      this.snapshotsService.create(uri, response.datetime),
    );
  }

  async run(task: Task) {
    const {
      mementos: { closest },
    } = await this.client.uri(task.url).mementos('2013');
    const snapshots = this.transformSnapshots(closest);
    await this.tasksService.addSnapshots(task.id, snapshots);
    return snapshots;
  }
}
