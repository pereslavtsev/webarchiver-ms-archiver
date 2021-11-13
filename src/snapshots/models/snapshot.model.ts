import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsUUID } from 'class-validator';
import { SnapshotStatus } from '@archiver/snapshots/enums';
import { Task } from '@archiver/tasks';

@Entity('snapshots')
export class Snapshot {
  static Status = SnapshotStatus;

  @IsUUID()
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column()
  readonly uri: string;

  @Column()
  readonly capturedAt: Date;

  @Column({
    type: 'enum',
    enum: SnapshotStatus,
    enumName: 'snapshot_status',
    default: SnapshotStatus.PENDING,
  })
  readonly status: SnapshotStatus;

  @CreateDateColumn()
  readonly createdAt: Date;

  @UpdateDateColumn()
  readonly updatedAt: Date;

  @ManyToOne(() => Task, (task) => task.snapshots, {
    onDelete: 'CASCADE',
    lazy: true,
  })
  readonly task: Promise<Task>;
}
