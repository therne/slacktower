import { PersistenceConfig } from './PersistenceConfig';
import { Driver, DriverType, InMemDriver } from './drivers';

export async function createDriver(config: PersistenceConfig): Promise<Driver> {
  let driver: Driver;
  switch (config.type) {
    case DriverType.INMEM:
      driver = new InMemDriver(config.inMem);
      break;

    default:
      throw new Error(`unknown driver type: ${config.type}`);
  }
  await driver.initialize();
  return driver;
}
