import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { LoggableProvider } from '@pereslavtsev/webarchiver-misc';
import { archiver } from '@webarchiver/protoc';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
import { from, Observable, Subject } from 'rxjs';
import { GetSnapshotsDto } from '../dto';
import { SnapshotsService } from '../services';
import { OnEvent } from '@nestjs/event-emitter';
import { Snapshot } from '../models';

const { SnapshotsServiceControllerMethods } = archiver.v1;

@Controller('snapshots')
@SnapshotsServiceControllerMethods()
export class SnapshotsController
  extends LoggableProvider
  implements archiver.v1.SnapshotsServiceController
{
  protected readonly subscriptions: Map<
    archiver.v1.Task['id'],
    Subject<archiver.v1.Snapshot>
  > = new Map();

  constructor(
    @RootLogger() rootLogger: Bunyan,
    protected snapshotsService: SnapshotsService,
  ) {
    super(rootLogger);
  }

  @OnEvent('snapshot.*')
  handleSnapshotEvents(snapshot: Snapshot) {
    const { status, taskId } = snapshot;

    const subject = this.subscriptions.get(taskId);
    if (!subject) {
      return;
    }

    subject.next(snapshot);

    switch (status) {
      case Snapshot.Status.FAILED:
      case Snapshot.Status.CANCELLED:
      case Snapshot.Status.CHECKED: {
        subject.complete();
        this.subscriptions.delete(taskId);
      }
    }
  }

  @OnEvent('task.*')
  handleTaskEvents(task: Task) {
    const { status } = task;

    const subject = this.subscriptions.get(task.id);
    if (!subject) {
      return;
    }

    switch (status) {
      case Task.Status.FAILED:
      case Task.Status.CANCELLED:
      case Task.Status.DONE: {
        subject.complete();
        this.subscriptions.delete(task.id);
      }
    }
  }

  @UsePipes(new ValidationPipe())
  getSnapshotsStream({
    taskId,
  }: GetSnapshotsDto): Observable<archiver.v1.Snapshot> {
    if (!this.subscriptions.has(taskId)) {
      this.subscriptions.set(taskId, new Subject());
    }

    const subject = this.subscriptions.get(taskId);

    from(this.snapshotsService.findByTaskId(taskId)).subscribe((snapshots) =>
      snapshots.forEach((snapshot) => subject.next(snapshot)),
    );

    return subject.asObservable();
  }
}
