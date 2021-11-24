import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { ConfigType } from '@nestjs/config';

import { database } from '../config';
import { LoggableProvider } from '@pereslavtsev/webarchiver-misc';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';

@Injectable()
export class TypeOrmConfigService
  extends LoggableProvider
  implements TypeOrmOptionsFactory
{
  constructor(
    @RootLogger() rootLogger: Bunyan,
    @Inject(database.KEY)
    private dbConfig: ConfigType<typeof database>,
  ) {
    super(rootLogger);
  }

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      url: this.dbConfig.url,
      entities: [__dirname, 'dist/**/*.model{.ts,.js}'],
      namingStrategy: new SnakeNamingStrategy(),
      //synchronize: true,
    };
  }
}
