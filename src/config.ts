import { ChildConfig, ConfigKey } from '~/utils';
import { PersistenceConfig } from '~/persistence';
import { SlackConfig } from '~/slack';

export class Config {
  @ConfigKey({ env: 'VERBOSE', default: true })
  verbose: boolean;

  @ConfigKey({ env: 'PORT', default: 3000 })
  port: number;

  @ChildConfig(() => SlackConfig)
  slack: SlackConfig;

  @ChildConfig(() => PersistenceConfig)
  persistence: PersistenceConfig;
}
