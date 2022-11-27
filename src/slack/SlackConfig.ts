import { ConfigKey } from '../utils';

export class SlackConfig {
  @ConfigKey({ env: 'SLACK_SIGNING_SECRET', warnIfNotGiven: true })
  slackSigningSecret: string;

  @ConfigKey({ env: 'SLACK_BOT_TOKEN', warnIfNotGiven: true })
  slackBotToken: string;

  @ConfigKey({ env: 'SLACK_APP_TOKEN', warnIfNotGiven: true })
  slackAppToken: string;
}
