import { Module } from '@nestjs/common';
import { SnapshotsService } from './services';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Snapshot } from './models';
import { SnapshotSubscriber } from './snapshot.subscriber';
import { SnapshotListener } from './listeners';
import { SnapshotsController } from './controllers';

@Module({
  imports: [TypeOrmModule.forFeature([Snapshot])],
  providers: [SnapshotListener, SnapshotsService, SnapshotSubscriber],
  exports: [SnapshotsService],
  controllers: [SnapshotsController],
})
export class SnapshotsModule {}
