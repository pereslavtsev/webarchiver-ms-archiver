import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { archiver } from '@pereslavtsev/webarchiver-protoc';

const tasksTable = new Table({
  name: 'tasks',
  columns: [
    {
      name: 'id',
      type: 'uuid',
      isPrimary: true,
      isGenerated: true,
      generationStrategy: 'uuid',
    },
    {
      name: 'url',
      type: 'varchar',
    },
    {
      name: 'desired_date',
      type: 'timestamp',
    },
    {
      name: 'status',
      type: 'numeric',
      enum: [...Object.values(archiver.ArchiverTask_Status).values()].map(
        (value) => String(value),
      ),
      enumName: 'task_status',
      default: String(archiver.ArchiverTask_Status.PENDING),
    },
    {
      name: 'quote',
      type: 'varchar',
    },
    {
      name: 'created_at',
      type: 'timestamp',
      default: 'now()',
    },
    {
      name: 'updated_at',
      type: 'timestamp',
      default: 'now()',
    },
  ],
});

export class TasksTable1637775359538 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(tasksTable);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await Promise.all([queryRunner.dropTable(tasksTable)]);
  }
}
