import { MessageAttachment } from '@slack/web-api';
import { Message, MessageLevel } from './Message';

interface SlackMessage {
  text?: string;
  username?: string;
  icon_url?: string;
  attachments?: MessageAttachment[];
}

export function buildSlackMessage(
  { message, level, fields, header, footer, displayProfile, details }: Message,
  id: string,
): SlackMessage {
  const blocks = details
    ? [
        {
          type: 'actions',
          elements: [{ type: 'button', value: `clickDetails_${id}`, text: { type: 'plain_text', text: 'Details' } }],
        },
      ]
    : [];

  const attachments =
    fields.length || header || footer || level !== 'info'
      ? [
          {
            author_name: header?.name,
            author_icon: header?.imageUrl,
            author_link: header?.link,
            color: getColorOfLevel(level),
            fields: fields.map((it) => ({
              title: it.displayName ?? it.name,
              value: it.displayValue ?? it.value,
              short: (it.displayValue ?? it.value).length < 30,
            })),
            blocks,
            footer,
          },
        ]
      : [];

  return {
    text: message,
    username: displayProfile?.name,
    icon_url: displayProfile?.imageUrl,
    attachments,
  };
}

function getColorOfLevel(level: MessageLevel): string | undefined {
  switch (level) {
    case MessageLevel.INFO:
      return;
    case MessageLevel.SUCCESS:
      return 'good';
    case MessageLevel.WARNING:
      return 'warning';
    case MessageLevel.ERROR:
      return 'danger';
    default:
      throw new Error(`invalid level: ${level}`);
  }
}
