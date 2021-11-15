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

  findById(id: Task['id']): Promise<Task> {
    return this.tasksRepository.findOneOrFail(id);
  }

  findAll({ pageSize, pageToken }: archiver.v1.ListTasksRequest) {
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

    return paginator.paginate(queryBuilder);
  }

  private async setStatus(taskId: Task['id'], status: Task['status']) {
    const task = await this.findById(taskId);
    return this.tasksRepository.save({
      ...task,
      status,
    });
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

  async create(
    data: Pick<Task, 'url' | 'quote' | 'desiredDate'>,
  ): Promise<Task> {
    // @ts-ignore
    data.desiredDate = new Date();
    const task = await this.tasksRepository.save(data);
    this.eventEmitter.emit('task.created', task);
    return task;
  }

  async addSnapshots(taskId: Task['id'], snapshots: Snapshot[]) {
    const task = await this.findById(taskId);
    const updatedTask = await this.tasksRepository.save({ ...task, snapshots });
    this.eventEmitter.emit('snapshots.received', { ...updatedTask, snapshots });
    return updatedTask;
  }
}
