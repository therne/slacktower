import { randomUUID } from 'crypto';
import { inject, injectable } from 'inversify';
import { TYPES } from '~/ioc';
import { Driver, Persistence } from '~/persistence';
import { Slack } from '~/slack';
import { mergeMessage } from '../grouping';
import { Message } from './Message';
import { findPersistedMessage, PersistedMessage, persistMessage } from './persistence';
import { buildSlackMessage } from './presentation';

@injectable()
export class Messenger {
  private readonly messageStore: Persistence<PersistedMessage>;

  constructor(@inject(TYPES.Driver) driver: Driver, private slack: Slack) {
    this.messageStore = new Persistence(driver);
  }

  async postMessage(message: Message) {
    if (message.grouping?.key) {
      const existingMessage = await findPersistedMessage(this.messageStore, {
        grouping: { key: message.grouping.key },
      });
      if (existingMessage) {
        return this.groupMessage(existingMessage, message);
      }
      console.log(`existing message not found with ${message.grouping.key}`);
      // not grouped :(
    }

    const id = `message:${randomUUID()}`;
    const { ts, channel } = await this.slack.sendMessage({
      channel: message.channel,
      ...buildSlackMessage(message, id),
    });
    if (message.details) {
      await this.postDetails(ts!, message.channel, message.details);
    }

    await persistMessage(this.messageStore, id, message, ts!, channel);
  }

  private async groupMessage(existing: PersistedMessage, newMessage: Message) {
    const mergedMessage = mergeMessage(existing, newMessage);

    await this.slack.editMessage({
      ts: existing.messageTs,
      channel: existing.channel,
      ...buildSlackMessage(mergedMessage, existing.id),
    });
    if (newMessage.details && existing.details !== newMessage.details) {
      await this.postDetails(existing.messageTs, existing.channel, newMessage.details);
    }

    await persistMessage(this.messageStore, existing.id, mergedMessage, existing.messageTs!);
  }

  private async postDetails(messageTs: string, channel: string, details: string) {
    return this.slack.reply(messageTs, {
      channel,
      attachments: [{ text: details }],
    });
  }
}
