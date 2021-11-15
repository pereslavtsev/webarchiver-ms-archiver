import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { archiver, toTimestamp } from '@webarchiver/protoc';
import { LoggableProvider } from '@pereslavtsev/webarchiver-misc';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
import { TasksService } from '../services';
import { Metadata } from '@grpc/grpc-js';
import { CreateTaskDto, GetTaskDto, ListTasksDto } from '../dto';
import { from, map, Observable, Subject } from 'rxjs';
import { Task } from '../models';
import { OnEvent } from '@nestjs/event-emitter';
import { Snapshot } from '@archiver/snapshots';

@Controller('tasks')
@archiver.ArchiverServiceControllerMethods()
export class TasksController
  extends LoggableProvider
  implements archiver.ArchiverServiceController
{
  protected readonly subscriptions: Map<
    archiver.Task['id'],
    Subject<archiver.Task>
  > = new Map();

  constructor(
    @RootLogger() rootLogger: Bunyan,
    private tasksService: TasksService,
  ) {
    super(rootLogger);
  }

  @UsePipes(new ValidationPipe())
  async listTasks({
    pageSize,
    pageToken,
    orderBy,
  }: ListTasksDto): Promise<archiver.ListTasksResponse> {
    const { data, cursor } = await this.tasksService.findAll({
      pageSize,
      pageToken,
      orderBy,
    });
    return {
      data,
      nextPageToken: cursor.afterCursor,
    };
  }

  @UsePipes(new ValidationPipe())
  createTask(data: CreateTaskDto): Observable<archiver.Task> {
    return from(this.tasksService.create(data)).pipe(map(this.transformTask));
  }

  @OnEvent('task.*')
  handleTaskCreatedEvent(task: Task) {
    const subject = this.subscriptions.get(task.id);
    if (!subject) {
      return;
    }
    subject.next(this.transformTask(task));

    switch (task.status) {
      case Task.Status.DONE:
      case Task.Status.FAILED:
      case Task.Status.CANCELLED: {
        subject.complete();
      }
    }
  }

  private transformTask({
    id,
    quote,
    url,
    desiredDate,
    status,
    createdAt,
    updatedAt,
    snapshots,
  }: Task): archiver.Task {
    return {
      id,
      quote,
      url,
      desiredDate: toTimestamp(desiredDate) as any,
      status,
      createdAt: toTimestamp(createdAt) as any,
      updatedAt: toTimestamp(updatedAt) as any,
      snapshots: snapshots?.map(
        ({
          id,
          status,
          createdAt,
          updatedAt,
          uri,
          capturedAt,
        }: Snapshot): archiver.Snapshot => {
          return {
            id,
            status,
            createdAt: toTimestamp(createdAt) as any,
            updatedAt: toTimestamp(updatedAt) as any,
            uri,
            capturedAt: toTimestamp(capturedAt) as any,
          };
        },
      ),
    };
  }

  @UsePipes(new ValidationPipe())
  createTaskStream(
    data: CreateTaskDto,
    metadata: Metadata,
  ): Observable<archiver.Task> {
    const subject = new Subject<archiver.Task>();
    from(this.tasksService.create(data))
      .pipe(map(this.transformTask))
      .subscribe((task) => {
        this.subscriptions.set(task.id, subject);
        subject.next(task);
      });

    return subject.asObservable();
  }

  @UsePipes(new ValidationPipe())
  getTask({ id }: GetTaskDto): Observable<archiver.Task> {
    return from(this.tasksService.findById(id)).pipe(map(this.transformTask));
  }

  @UsePipes(new ValidationPipe())
  cancelTask({ id }: GetTaskDto): Observable<archiver.Task> {
    return from(this.tasksService.setCancelled(id)).pipe(
      map(this.transformTask),
    );
  }
}
