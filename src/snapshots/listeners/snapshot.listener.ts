import { Injectable } from '@nestjs/common';
import { LoggableProvider } from '@pereslavtsev/webarchiver-misc';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';

@Injectable()
export class SnapshotListener extends LoggableProvider {
  constructor(@RootLogger() rootLogger: Bunyan) {
    super(rootLogger);
  }
}
