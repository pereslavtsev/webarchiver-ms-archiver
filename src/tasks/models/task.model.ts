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

@Entity('tasks')
export class Task {
  @IsUUID()
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @IsUrl()
  @Column()
  readonly url: string;

  @Column('timestamp')
  readonly desiredDate: Date;

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
