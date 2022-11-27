import { inject, injectable } from 'inversify';
import { TYPES } from '../ioc';
import { PersistedMessage } from '../message';
import { Driver, Persistence } from '../persistence';
import { Slack } from '../slack';

@injectable()
export class Enrichmenter {
  private readonly messageStore: Persistence<PersistedMessage>;

  constructor(@inject(TYPES.Driver) driver: Driver, private slack: Slack) {
    this.messageStore = new Persistence(driver);
  }
}
