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

@Entity('tasks')
export class Task {
  static Status = archiver.Task_Status;

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
    enum: archiver.Task_Status,
    enumName: 'task_status',
    default: archiver.Task_Status.PENDING,
  })
  readonly status: archiver.Task_Status;

  @IsNotEmpty()
  @Column()
  readonly quote: string;

  @CreateDateColumn()
  readonly createdAt: Date;

  @UpdateDateColumn()
  readonly updatedAt: Date;

  @OneToMany(() => Snapshot, (snapshot) => snapshot.task, {
    cascade: true,
    eager: true,
  })
  readonly snapshots: Snapshot[];
}
