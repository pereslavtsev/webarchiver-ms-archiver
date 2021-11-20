import { Transform } from 'class-transformer';
import { toTimestamp } from '@webarchiver/protoc';

export function TransformDate() {
  return Transform(
    ({ value }) => {
      switch (typeof value) {
        case 'string':
        case 'number': {
          return toTimestamp(value);
        }
        default: {
          if (value instanceof Date) {
            return toTimestamp(value);
          }
          return value;
        }
      }
    },
    { groups: ['grpc'] },
  );
}
