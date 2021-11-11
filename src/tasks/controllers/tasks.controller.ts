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

@Controller('tasks')
@TasksServiceControllerMethods()
export class TasksController
  extends CoreProvider
  implements TasksServiceController
{
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

  @UsePipes(new ValidationPipe())
  getTask({ id }: GetTaskDto): Promise<Task> {
    return this.tasksService.findById(id);
  }
}
