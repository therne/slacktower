import { Body, Patch, Post, Route, SuccessResponse } from '@tsoa/runtime';
import { injectable } from 'inversify';
import { Message, MessageLevel } from '../message';
import { Messenger } from '../message/Messenger';
import { assignWithoutNull } from '../utils';
import { MessageRequest } from './requests-responses';

@injectable()
@Route('/v1')
export class APIV1Controller {
  constructor(private messenger: Messenger) {}

  @Post('/message')
  @SuccessResponse(204)
  async message(@Body() req: MessageRequest) {
    const message: Message = assignWithoutNull({ level: MessageLevel.INFO, fields: [] }, req);
    await this.messenger.postMessage(message);
  }

  @Patch('/enrich')
  async enrich() {

  }
}
