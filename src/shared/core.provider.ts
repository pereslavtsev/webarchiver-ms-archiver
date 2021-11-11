import { Injectable } from '@nestjs/common';
import { Bunyan } from '@eropple/nestjs-bunyan';
import { Metadata, status as GrpcStatus } from '@grpc/grpc-js';
import { EntityNotFoundError } from 'typeorm';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export abstract class CoreProvider {
  protected readonly log: Bunyan;

  protected constructor(rootLogger: Bunyan) {
    this.log = rootLogger.child({ component: this.constructor.name });
  }

  protected exceptionFilter(error: Error, metadata: Metadata) {
    const log = this.log.child({ reqId: metadata.get('x-correlation-id') });
    log.error(error);
    if (error instanceof EntityNotFoundError) {
      throw new RpcException({
        code: GrpcStatus.NOT_FOUND,
      });
    }
    throw new RpcException({
      code: GrpcStatus.UNKNOWN,
    });
  }
}
