import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import {
  Task,
  ListTasksResponse,
  TasksServiceController,
  TasksServiceControllerMethods,
} from '@webarchiver/protoc/dist/archiver';
import { CoreProvider } from '@archiver/shared';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
import { TasksService } from '../services';
import { Metadata } from '@grpc/grpc-js';
import { CreateTaskDto, GetTaskDto, ListTasksDto } from '../dto';
import { from, map, Observable, Subject } from 'rxjs';
import { Task as TaskModel } from '../models';
import { OnEvent } from '@nestjs/event-emitter';

@Controller('tasks')
@TasksServiceControllerMethods()
export class TasksController
  extends CoreProvider
  implements TasksServiceController
{
  protected readonly subscriptions: Map<Task['id'], Subject<Task>> = new Map();

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
  }: ListTasksDto): Promise<ListTasksResponse> {
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
  createTask(data: CreateTaskDto): Promise<Task> {
    return this.tasksService.create(data);
  }

  @OnEvent('task.*')
  handleTaskCreatedEvent(task: TaskModel) {
    const subject = this.subscriptions.get(task.id);
    if (!subject) {
      return;
    }
    subject.next(this.transformTask(task));
    switch (task.status) {
      case TaskModel.Status.DONE: {
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
  }: TaskModel): Task {
    return {
      id,
      quote,
      url,
      desiredDate,
      status,
      createdAt,
      updatedAt,
    };
  }

  @UsePipes(new ValidationPipe())
  createTaskStream(data: CreateTaskDto, metadata: Metadata): Observable<Task> {
    const subject = new Subject<Task>();
    from(this.tasksService.create(data))
      .pipe(map(this.transformTask))
      .subscribe((task) => {
        this.subscriptions.set(task.id, subject);
        subject.next(task);
      });

    return subject.asObservable();
  }

  @UsePipes(new ValidationPipe())
  getTask({ id }: GetTaskDto): Promise<Task> {
    return this.tasksService.findById(id);
  }
}
