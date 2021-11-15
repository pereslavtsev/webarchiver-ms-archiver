import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { grpcClientOptions } from './grpc.options';
import { ROOT_LOGGER } from '@eropple/nestjs-bunyan';
import { GrpcLoggingInterceptor } from '@pereslavtsev/webarchiver-misc';
import { Logger } from './shared';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    ...grpcClientOptions,
    logger: new Logger(),
  });
  const rootLogger = app.get(ROOT_LOGGER);
  app.useGlobalInterceptors(new GrpcLoggingInterceptor(rootLogger));
  app.enableShutdownHooks();
  await app.listen();
}
bootstrap();
