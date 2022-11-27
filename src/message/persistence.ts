import { PartialDeep } from 'type-fest';
import { Persistence } from '~/persistence';
import { Message } from './Message';

export interface PersistedMessage extends Message {
  id: string;
  messageTs: string;
}

export async function findPersistedMessage(
  messageStore: Persistence<PersistedMessage>,
  where: PartialDeep<PersistedMessage>,
) {
  return messageStore.find(where);
}

export async function persistMessage(
  messageStore: Persistence<PersistedMessage>,
  id: string,
  message: Message,
  messageTs: string,
  channel?: string,
) {
  await messageStore.put({ id, ...message, messageTs, channel: channel ?? message.channel }, 60 * 60 * 1000);
}
