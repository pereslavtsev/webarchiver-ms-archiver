import { Module } from '@nestjs/common';
import { SnapshotsService } from './services';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Snapshot } from './models';

@Module({
  imports: [TypeOrmModule.forFeature([Snapshot])],
  providers: [SnapshotsService],
  exports: [SnapshotsService],
})
export class SnapshotsModule {}
