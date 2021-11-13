import { Injectable } from '@nestjs/common';
import { CoreProvider } from '@archiver/shared';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';

@Injectable()
export class SnapshotListener extends CoreProvider {
  constructor(@RootLogger() rootLogger: Bunyan) {
    super(rootLogger);
  }
}
