import { DynamicModule, Module, Provider } from '@nestjs/common';
import MementoClient, { MementoClientOptions } from '@mementoweb/client';
import { MEMENTO_CLIENT, MEMENTO_MODULE_OPTIONS } from './memento.constants';

@Module({})
export class MementoModule {
  public static forRoot(options: MementoClientOptions): DynamicModule {
    const providers = this.createProviders(options);

    return {
      module: MementoModule,
      providers: providers,
      exports: providers,
    };
  }

  private static createProviders(options: MementoClientOptions): Provider[] {
    return [
      {
        provide: MEMENTO_MODULE_OPTIONS,
        useValue: options,
      },
      {
        provide: MEMENTO_CLIENT,
        useFactory: () => new MementoClient(options),
      },
    ];
  }
}
