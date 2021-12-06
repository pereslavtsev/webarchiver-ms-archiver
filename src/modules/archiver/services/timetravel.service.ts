import { Injectable } from '@nestjs/common';
import { InjectMementoClient } from '@archiver/memento';
import type MementoClient from '@mementoweb/client';
import type { Task } from '@archiver/tasks';
import { TasksService } from '@archiver/tasks';
import type { MementosResponse } from '@mementoweb/client/lib/classes';
import { Snapshot, SnapshotsService } from '@archiver/snapshots';
import { LoggableProvider } from '@pereslavtsev/webarchiver-misc';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';

@Injectable()
export class TimetravelService extends LoggableProvider {
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
    taskId: Task['id'],
  ): Snapshot[] {
    return response.uri.map((uri) =>
      this.snapshotsService.create(uri, response.datetime, taskId),
    );
  }

  async run(task: Task) {
    const {
      mementos: { closest },
    } = await this.client.uri(task.url).mementos(task.desiredDate);
    const snapshots = this.transformSnapshots(closest, task.id);
    await this.tasksService.addSnapshots(
      task.id,
      snapshots.map((snapshot) => ({ ...snapshot, taskId: task.id })),
    );
    return snapshots;
  }
}
