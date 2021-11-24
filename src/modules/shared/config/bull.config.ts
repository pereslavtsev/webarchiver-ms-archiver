import { registerAs } from '@nestjs/config';

export default registerAs('bull', () => ({
  url: process.env.REDIS_URL,
}));
