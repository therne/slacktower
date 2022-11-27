import { PartialDeep } from 'type-fest';
import { Driver, DriverObject } from './drivers';

export class Persistence<T extends DriverObject> {
  constructor(private driver: Driver) {}

  async put(value: T, timeToLive: number) {
    return this.driver.save(value, timeToLive);
  }

  async find(where: PartialDeep<T>): Promise<T | undefined> {
    return (await this.driver.find(where)) as T | undefined;
  }
}
