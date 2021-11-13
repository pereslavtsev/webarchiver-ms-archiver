import { Module } from '@nestjs/common';
import { SnapshotsService } from './services';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Snapshot } from './models';
import { SnapshotSubscriber } from './snapshot.subscriber';

@Module({
  imports: [TypeOrmModule.forFeature([Snapshot])],
  providers: [SnapshotsService, SnapshotSubscriber],
  exports: [SnapshotsService],
})
export class SnapshotsModule {}
