import { Transport, ClientOptions } from '@nestjs/microservices';
import { archiver } from '@webarchiver/protoc';

const port = process.env.PORT || 50051;

export const grpcClientOptions: ClientOptions = {
  transport: Transport.GRPC,
  options: {
    url: `0.0.0.0:${port}`,
    package: archiver.v1.protobufPackage,
    protoPath: archiver.getProtoPath(),
  },
};
