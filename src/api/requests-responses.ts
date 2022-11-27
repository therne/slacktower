import { Message, MessageField, MessageLevel } from '~/message';

type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type MessageRequest = Omit<Message, 'level' | 'fields'> & { level?: MessageLevel; fields?: MessageField[] };
