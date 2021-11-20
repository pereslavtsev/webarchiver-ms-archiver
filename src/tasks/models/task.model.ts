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
import { archiver } from '@webarchiver/protoc';
import { TransformDate } from '@archiver/shared';

@Entity('tasks')
export class Task {
  static Status = archiver.v1.Task_Status;

  @IsUUID()
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @IsUrl()
  @Column()
  readonly url: string;

  @Column('timestamp')
  @TransformDate()
  readonly desiredDate: Date;

  @Column({
    type: 'enum',
    enum: archiver.v1.Task_Status,
    enumName: 'task_status',
    default: archiver.v1.Task_Status.PENDING,
  })
  readonly status: archiver.v1.Task_Status;

  @IsNotEmpty()
  @Column()
  readonly quote: string;

  @CreateDateColumn()
  @TransformDate()
  readonly createdAt: Date;

  @UpdateDateColumn()
  @TransformDate()
  readonly updatedAt: Date;

  @OneToMany(() => Snapshot, (snapshot) => snapshot.task, {
    cascade: true,
    eager: true,
  })
  readonly snapshots: Snapshot[];
}
