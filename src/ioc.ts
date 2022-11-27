import { IocContainer } from '@tsoa/runtime';
import { Container } from 'inversify';
import { Config } from './config';
import { createDriver, Driver } from './persistence';
import { loadConfig } from './utils';

export const CONTAINER = new Container({ autoBindInjectable: true });

export const TYPES = {
  Driver: Symbol('Driver'),
};

export async function initializeDependency(container = CONTAINER) {
  const config = loadConfig(Config, {
    iocHook: (type, object) => container.bind(type).toConstantValue(object),
  });

  const driver = await createDriver(config.persistence);
  container.bind<Driver>(TYPES.Driver).toConstantValue(driver);

  return { config, container };
}

// referenced by tsoa
export const iocContainer: IocContainer = {
  get: <T>(controller: { prototype: T }): T => CONTAINER.get(controller),
};
