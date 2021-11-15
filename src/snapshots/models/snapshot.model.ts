import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsUUID } from 'class-validator';
import { archiver } from '@webarchiver/protoc';
import { Task } from '@archiver/tasks';

@Entity('snapshots')
export class Snapshot {
  static Status = archiver.v1.Snapshot_Status;

  @IsUUID()
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column()
  readonly uri: string;

  @Column()
  readonly capturedAt: Date;

  @Column({
    type: 'enum',
    enum: Snapshot.Status,
    enumName: 'snapshot_status',
    default: Snapshot.Status.PENDING,
  })
  readonly status: archiver.v1.Snapshot_Status;

  @CreateDateColumn()
  readonly createdAt: Date;

  @UpdateDateColumn()
  readonly updatedAt: Date;

  @ManyToOne(() => Task, (task) => task.snapshots, {
    onDelete: 'CASCADE',
    lazy: true,
  })
  readonly task: Task | Promise<Task>;
}
