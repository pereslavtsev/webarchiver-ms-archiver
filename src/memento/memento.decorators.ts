import { Inject } from '@nestjs/common';
import { MEMENTO_CLIENT } from './memento.constants';

export function InjectMementoClient() {
  return Inject(MEMENTO_CLIENT);
}
