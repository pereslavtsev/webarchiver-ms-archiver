import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { catchError, Observable, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CoreProvider } from '@archiver/shared';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
import { v4 as uuidv4 } from 'uuid';
import type { ServerUnaryCallImpl } from '@grpc/grpc-js/build/src/server-call';

@Injectable()
export class LoggingInterceptor
  extends CoreProvider
  implements NestInterceptor
{
  constructor(@RootLogger() rootLogger: Bunyan) {
    super(rootLogger);
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const data = context.switchToRpc().getData();
    const unaryCall = context.getArgByIndex<ServerUnaryCallImpl<any, any>>(2);
    const stream = unaryCall['call'];
    const metadata = unaryCall.metadata;

    if (!metadata.get('x-correlation-id').length) {
      metadata.set('x-correlation-id', uuidv4());
      unaryCall.sendMetadata(metadata);
    }

    const reqId = metadata.get('x-correlation-id');
    const method = stream['handler'].type;
    const url = stream['handler'].path;
    const remoteAddress = unaryCall.getPeer()?.split(':')?.[0];

    const log = this.log.child({
      reqId,
      req: { method, url, remoteAddress },
      res: {},
      data,
      metadata,
    });

    log.info(`Calling ${context.getType()} method...`);

    const now = Date.now();
    return next.handle().pipe(
      tap(() =>
        log.info(
          {
            res: { responseTime: Date.now() - now },
          },
          `Finished`,
        ),
      ),
      catchError((err) => {
        log.error('Failed');
        return throwError(err);
      }),
    );
  }
}
