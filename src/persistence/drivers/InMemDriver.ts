import { clearInterval } from 'timers';
import { PartialDeep } from 'type-fest';
import { ConfigKey, containsDeep } from '../../utils';
import { Driver, DriverObject } from './driver';

export class InMemDriverConfig {
  @ConfigKey({ env: 'INMEM_MAX_OBJECTS', default: 1024 })
  maxObjects: number;

  @ConfigKey({ env: 'INMEM_VACCUM_INTERVAL_MS', default: 60000 })
  vacuumIntervalInMs: number;
}

export class InMemDriver implements Driver {
  private objects: { [key: string]: { object: DriverObject; deadline: number } } = {};
  private readonly vacuumTimer: NodeJS.Timer;

  constructor(public config: InMemDriverConfig) {
    this.vacuumTimer = setInterval(() => this.vacuumExpiredObjects(), config.vacuumIntervalInMs);
  }

  async initialize(): Promise<void> {}

  async save(object: DriverObject, timeToLiveInMs: number): Promise<void> {
    this.objects[object.id] = {
      object,
      deadline: Date.now() + timeToLiveInMs,
    };
  }

  async find(where: PartialDeep<DriverObject>): Promise<DriverObject | undefined> {
    return Object.values(this.objects).find(({ object }) => containsDeep(object, where))?.object;
  }

  private vacuumExpiredObjects() {
    let totalVacuumed = 0;
    for (const key in this.objects) {
      if (Date.now() > this.objects[key].deadline) {
        delete this.objects[key];
        totalVacuumed++;
      }
    }
    if (totalVacuumed > 0) {
      console.log('InMemDriver', `vacuumed ${totalVacuumed} objects`);
    }
  }

  async close() {
    clearInterval(this.vacuumTimer);
  }
}
