import { forwardRef, Module } from '@nestjs/common';
import { SnapshotsService } from './services';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Snapshot } from './models';
import { SnapshotSubscriber } from './snapshot.subscriber';
import { SnapshotListener } from './listeners';

@Module({
  imports: [TypeOrmModule.forFeature([Snapshot])],
  providers: [SnapshotListener, SnapshotsService, SnapshotSubscriber],
  exports: [SnapshotsService],
})
export class SnapshotsModule {}
