import { ChildConfig, ConfigKey } from '../utils';
import { InMemDriverConfig, DriverType } from './drivers';

export class PersistenceConfig {
  @ConfigKey({ env: 'PERSISTENCE_TYPE', default: DriverType.INMEM })
  type: DriverType;

  @ChildConfig(() => InMemDriverConfig)
  inMem: InMemDriverConfig;
}
