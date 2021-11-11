import pretty from '@mechanicalhuman/bunyan-pretty';
import bunyan from 'bunyan';

export const LOGGER = bunyan.createLogger({
  name: 'crawler',
  stream: pretty(process.stdout, {
    timeStamps: false,
  }),
  level: 'debug',
});
