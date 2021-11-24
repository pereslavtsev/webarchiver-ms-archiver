import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';
import { snapshots } from '@pereslavtsev/webarchiver-protoc';

const snapshotsTable = new Table({
  name: 'snapshots',
  columns: [
    {
      name: 'id',
      type: 'uuid',
      isPrimary: true,
      isGenerated: true,
      generationStrategy: 'uuid',
    },
    {
      name: 'uri',
      type: 'varchar',
    },
    {
      name: 'captured_at',
      type: 'timestamp',
    },
    {
      name: 'status',
      type: 'numeric',
      enum: [...Object.values(snapshots.Snapshot_Status).values()].map(
        (value) => String(value),
      ),
      enumName: 'snapshot_status',
      default: String(snapshots.Snapshot_Status.PENDING),
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
    {
      name: 'task_id',
      type: 'uuid',
    },
  ],
});

const taskFK = new TableForeignKey({
  columnNames: ['task_id'],
  referencedTableName: 'tasks',
  referencedColumnNames: ['id'],
});

export class SnapshotsTable1637779355805 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(snapshotsTable);
    await queryRunner.createForeignKey(snapshotsTable, taskFK);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(snapshotsTable);
  }
}
