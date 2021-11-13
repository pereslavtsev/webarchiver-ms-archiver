import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsNotEmpty, IsUrl, IsUUID } from 'class-validator';
import { Snapshot } from '@archiver/snapshots';
import { TaskStatus } from '../enums';

@Entity('tasks')
export class Task {
  static Status = TaskStatus;

  @IsUUID()
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @IsUrl()
  @Column()
  readonly url: string;

  @Column('timestamp')
  readonly desiredDate: Date;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    enumName: 'task_status',
    default: TaskStatus.PENDING,
  })
  readonly status: TaskStatus;

  @IsNotEmpty()
  @Column()
  readonly quote: string;

  @CreateDateColumn()
  readonly createdAt: Date;

  @UpdateDateColumn()
  readonly updatedAt: Date;

  @OneToMany(() => Snapshot, (snapshot) => snapshot.task, { cascade: true })
  readonly snapshots: Snapshot[];
}
