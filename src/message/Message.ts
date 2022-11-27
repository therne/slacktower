import { GroupingOption } from '../grouping';

export enum MessageLevel {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
}

export interface Message {
  channel: string;
  level: MessageLevel;
  message: string;
  fields: MessageField[];
  grouping?: GroupingOption;

  header?: {
    imageUrl: string;
    name: string;
    link: string;
  };
  footer?: string;
  details?: string;
  displayProfile?: {
    name: string;
    imageUrl: string;
  };
}

export interface MessageField {
  name: string;
  value: string;
  hide?: boolean;
  displayName?: string;
  displayValue?: string;
}
