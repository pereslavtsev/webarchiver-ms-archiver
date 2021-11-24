import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { archiver } from '@pereslavtsev/webarchiver-protoc';
import { LoggableProvider } from '@pereslavtsev/webarchiver-misc';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
import { TasksService } from '../services';
import { CreateTaskDto, GetTaskDto, ListTasksDto } from '../dto';
import { from, Observable, Subject } from 'rxjs';
import { Task } from '../models';
import { OnEvent } from '@nestjs/event-emitter';
import { plainToClass } from 'class-transformer';

@Controller('tasks')
@archiver.ArchiverServiceControllerMethods()
export class TasksController
  extends LoggableProvider
  implements archiver.ArchiverServiceController
{
  protected readonly subscriptions: Map<
    archiver.ArchiverTask['id'],
    Subject<archiver.ArchiverTask>
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
  }: ListTasksDto): Promise<archiver.ListArchiverTasksResponse> {
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
  createTask(data: CreateTaskDto): Promise<archiver.ArchiverTask> {
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
  createTaskStream(data: CreateTaskDto): Observable<archiver.ArchiverTask> {
    const subject = new Subject<archiver.ArchiverTask>();

    from(this.tasksService.create(plainToClass(CreateTaskDto, data))).subscribe(
      (task) => {
        this.subscriptions.set(task.id, subject);
        subject.next(task);
      },
    );

    return subject.asObservable();
  }

  @UsePipes(new ValidationPipe())
  getTask({ id }: GetTaskDto): Promise<archiver.ArchiverTask> {
    return this.tasksService.findById(id);
  }

  @UsePipes(new ValidationPipe())
  cancelTask({ id }: GetTaskDto): Promise<archiver.ArchiverTask> {
    return this.tasksService.setCancelled(id);
  }
}
