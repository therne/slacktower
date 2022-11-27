import { App } from '@slack/bolt';
import {
  ChatPostMessageArguments,
  ChatPostMessageResponse,
  ChatUpdateArguments,
  ChatUpdateResponse
} from '@slack/web-api';
import { injectable } from 'inversify';
import { SlackConfig } from './SlackConfig';

@injectable()
export class Slack {
  public app: App;

  constructor(private config: SlackConfig) {
    this.app = new App({
      appToken: config.slackAppToken,
      signingSecret: config.slackSigningSecret,
      token: config.slackBotToken,
    });
  }

  sendMessage(req: ChatPostMessageArguments): Promise<ChatPostMessageResponse> {
    return this.app.client.chat.postMessage(req);
  }

  editMessage(req: ChatUpdateArguments): Promise<ChatUpdateResponse> {
    return this.app.client.chat.update(req);
  }

  reply(subjectMessageTs: string, req: ChatPostMessageArguments): Promise<ChatPostMessageResponse> {
    return this.sendMessage({ ...req, thread_ts: subjectMessageTs });
  }
}
