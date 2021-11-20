import { Injectable } from '@nestjs/common';
import { InjectTasksRepository } from '../tasks.decorators';
import type { TasksRepository } from '../tasks.types';
import { Task } from '../models';
import { LoggableProvider } from '@pereslavtsev/webarchiver-misc';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
import type { archiver } from '@webarchiver/protoc';
import { buildPaginator } from 'typeorm-cursor-pagination';
import { Snapshot } from '@archiver/snapshots';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { plainToClass } from 'class-transformer';
import { CreateTaskDto } from '../dto';

@Injectable()
export class TasksService extends LoggableProvider {
  constructor(
    @RootLogger() rootLogger: Bunyan,
    @InjectTasksRepository()
    private tasksRepository: TasksRepository,
    private eventEmitter: EventEmitter2,
  ) {
    super(rootLogger);
  }

  async findById(id: Task['id']): Promise<Task> {
    const task = await this.tasksRepository.findOneOrFail(id);
    return plainToClass(Task, task);
  }

  async findAll({ pageSize, pageToken }: archiver.v1.ListTasksRequest) {
    const queryBuilder = this.tasksRepository.createQueryBuilder('task');

    const paginator = buildPaginator({
      entity: Task,
      paginationKeys: ['id'],
      query: {
        limit: pageSize,
        order: 'DESC',
        afterCursor: pageToken,
      },
    });

    const { data, ...result } = await paginator.paginate(queryBuilder);

    return { data: plainToClass(Task, data), ...result };
  }

  private async setStatus(taskId: Task['id'], status: Task['status']) {
    const task = await this.findById(taskId);
    const updatedTask = await this.tasksRepository.save({
      ...task,
      status,
    });
    return plainToClass(Task, updatedTask);
  }

  async setInProgress(taskId: Task['id']): Promise<Task> {
    const task = await this.setStatus(taskId, Task.Status.IN_PROGRESS);
    this.eventEmitter.emit('task.in_progress', task);
    return task;
  }

  async setDone(taskId: Task['id']): Promise<Task> {
    const task = await this.setStatus(taskId, Task.Status.DONE);
    this.eventEmitter.emit('task.done', task);
    return task;
  }

  async setFailed(taskId: Task['id']): Promise<Task> {
    const task = await this.setStatus(taskId, Task.Status.FAILED);
    this.eventEmitter.emit('task.failed', task);
    return task;
  }

  async setCancelled(taskId: Task['id']): Promise<Task> {
    const task = await this.setStatus(taskId, Task.Status.CANCELLED);
    this.eventEmitter.emit('task.cancelled', task);
    return task;
  }

  async create(data: CreateTaskDto): Promise<Task> {
    const task = await this.tasksRepository.save(data);
    this.eventEmitter.emit('task.created', task);
    return plainToClass(Task, task);
  }

  async addSnapshots(taskId: Task['id'], snapshots: Snapshot[]) {
    const task = await this.findById(taskId);
    const updatedTask = await this.tasksRepository.save({ ...task, snapshots });
    this.eventEmitter.emit('snapshots.received', { ...updatedTask, snapshots });
    return plainToClass(Task, updatedTask);
  }
}
