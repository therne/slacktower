import { Message, MessageField, MessageLevel } from '../message';

export interface Enrichment {
  filter: MessageFilter[];
  transform: MessageTransformation[];
  timeout: string;
}

export interface MessageFilter {
  fieldName: string;
  value: string;
}

export interface MessageTransformation {
  addField?: MessageField;
  editField?: {
    fieldName: string;
    newValue: string;
    newDisplayValue?: string;
  }
  addReply?: string;

  editLevel?: MessageLevel;
  addReaction?: string;
  removeReaction?: string;
}
