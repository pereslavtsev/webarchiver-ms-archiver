import pretty from '@mechanicalhuman/bunyan-pretty';
import bunyan from 'bunyan';

export const LOGGER = bunyan.createLogger({
  name: 'archiver',
  stream: pretty(process.stdout, {
    timeStamps: false,
  }),
  level: 'debug',
});
