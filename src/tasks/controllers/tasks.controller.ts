import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { archiver } from '@webarchiver/protoc';
import { LoggableProvider } from '@pereslavtsev/webarchiver-misc';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
import { TasksService } from '../services';
import { CreateTaskDto, GetTaskDto, ListTasksDto } from '../dto';
import { from, Observable, Subject } from 'rxjs';
import { Task } from '../models';
import { OnEvent } from '@nestjs/event-emitter';
import { plainToClass } from 'class-transformer';

@Controller('tasks')
@archiver.v1.ArchiverServiceControllerMethods()
export class TasksController
  extends LoggableProvider
  implements archiver.v1.ArchiverServiceController
{
  protected readonly subscriptions: Map<
    archiver.v1.Task['id'],
    Subject<archiver.v1.Task>
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
  }: ListTasksDto): Promise<archiver.v1.ListTasksResponse> {
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
  createTask(data: CreateTaskDto): Promise<archiver.v1.Task> {
    return this.tasksService.create(plainToClass(CreateTaskDto, data));
  }

  @OnEvent('task.*')
  handleTaskCreatedEvent(task: Task) {
    const subject = this.subscriptions.get(task.id);
    if (!subject) {
      return;
    }
    subject.next(task);

    switch (task.status) {
      case Task.Status.DONE:
      case Task.Status.FAILED:
      case Task.Status.CANCELLED: {
        subject.complete();
      }
    }
  }

  @UsePipes(new ValidationPipe())
  createTaskStream(data: CreateTaskDto): Observable<archiver.v1.Task> {
    const subject = new Subject<archiver.v1.Task>();

    from(this.tasksService.create(data)).subscribe((task) => {
      this.subscriptions.set(task.id, subject);
      subject.next(task);
    });

    return subject.asObservable();
  }

  @UsePipes(new ValidationPipe())
  getTask({ id }: GetTaskDto): Promise<archiver.v1.Task> {
    return this.tasksService.findById(id);
  }

  @UsePipes(new ValidationPipe())
  cancelTask({ id }: GetTaskDto): Promise<archiver.v1.Task> {
    return this.tasksService.setCancelled(id);
  }
}
