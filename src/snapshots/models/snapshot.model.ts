import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsUUID } from 'class-validator';
import { snapshots } from '@pereslavtsev/webarchiver-protoc';
import { Task } from '@archiver/tasks';
import { TransformDate } from '@archiver/shared';

@Entity('snapshots')
export class Snapshot {
  static Status = snapshots.Snapshot_Status;

  @IsUUID()
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column()
  readonly uri: string;

  @Column()
  @TransformDate()
  readonly capturedAt: Date;

  @Column({
    type: 'enum',
    enum: Snapshot.Status,
    enumName: 'snapshot_status',
    default: Snapshot.Status.PENDING,
  })
  readonly status: snapshots.Snapshot_Status;

  @CreateDateColumn()
  @TransformDate()
  readonly createdAt: Date;

  @UpdateDateColumn()
  @TransformDate()
  readonly updatedAt: Date;

  @IsUUID()
  @Column('uuid')
  readonly taskId: Task['id'];

  @ManyToOne(() => Task, (task) => task.snapshots, {
    onDelete: 'CASCADE',
    lazy: true,
  })
  @JoinColumn({ name: 'task_id' })
  readonly task: Task | Promise<Task>;
}
