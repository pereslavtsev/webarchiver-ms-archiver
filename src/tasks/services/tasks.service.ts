import { Injectable } from '@nestjs/common';
import { InjectTasksRepository } from '../tasks.decorators';
import type { TasksRepository } from '../tasks.types';
import { Task } from '../models';
import { CoreProvider } from '@archiver/shared';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
import type { ListTasksRequest } from '@webarchiver/protoc/dist/archiver';
import { buildPaginator } from 'typeorm-cursor-pagination';
import { Snapshot } from '@archiver/snapshots';

@Injectable()
export class TasksService extends CoreProvider {
  constructor(
    @RootLogger() rootLogger: Bunyan,
    @InjectTasksRepository()
    private tasksRepository: TasksRepository,
  ) {
    super(rootLogger);
  }

  findById(id: Task['id']): Promise<Task> {
    return this.tasksRepository.findOneOrFail(id);
  }

  findAll({ pageSize, pageToken }: ListTasksRequest) {
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

  create(task: Pick<Task, 'url' | 'quote' | 'desiredDate'>): Promise<Task> {
    console.log('task', task);
    // @ts-ignore
    task.desiredDate = new Date();
    return this.tasksRepository.save(task);
  }

  async addSnapshots(taskId: Task['id'], snapshots: Snapshot[]) {
    const task = await this.findById(taskId);
    return this.tasksRepository.save({ ...task, snapshots });
  }
}
