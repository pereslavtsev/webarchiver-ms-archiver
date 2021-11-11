import { Module } from '@nestjs/common';
import { TasksController } from './controllers';
import { TasksService } from './services';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './models';

@Module({
  imports: [TypeOrmModule.forFeature([Task])],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
