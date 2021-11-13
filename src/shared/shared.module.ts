import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { LoggingModule } from '@eropple/nestjs-bunyan';
import { LOGGER } from './logger';
import { ConfigModule } from '@nestjs/config';
import * as config from './config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from './services';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Global()
@Module({
  imports: [
    LoggingModule.forRoot(LOGGER, {
      skipRequestInterceptor: true,
    }),
    ConfigModule.forRoot({
      load: [...Object.values(config)],
      isGlobal: true,
    }),
    EventEmitterModule.forRoot({ wildcard: true }),
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
  ],
  exports: [BullModule, LoggingModule, TypeOrmModule],
})
export class SharedModule {}
