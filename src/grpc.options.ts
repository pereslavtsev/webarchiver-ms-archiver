import { Transport, ClientOptions } from '@nestjs/microservices';
import protoc from '@webarchiver/protoc';

const port = process.env.PORT || 50051;

export const grpcClientOptions: ClientOptions = {
  transport: Transport.GRPC,
  options: {
    url: `0.0.0.0:${port}`,
    package: protoc.archiver.protobufPackage,
    protoPath: protoc.archiver.getProtoPath(),
  },
};
