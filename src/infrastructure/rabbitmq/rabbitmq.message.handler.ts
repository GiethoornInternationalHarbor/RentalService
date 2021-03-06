import { injectable } from 'inversify';
import { IMessageHandler,  IMessageReceivedCallback } from '../messaging/imessage.handler';
import { MessageType } from '../messaging/message.types';
import { RabbitMQChannel } from './rabbitmq.channel';

@injectable()
export class RabbitMQMessageHandler implements IMessageHandler {
  constructor(private queue: string, private rabbitChannel: RabbitMQChannel) {}

  public async start(onMessage: IMessageReceivedCallback) {
    return await this.rabbitChannel.consume(this.queue, async msg => {
      if (msg == null) {
        return;
      }

      // Parse the type header
      const receivedType = MessageType.parse(msg.properties.type);

      if (receivedType === MessageType.Unknown) {
        // We do not need to handle this, since it is not in our known MessageType values
        return;
      }

      // Since we are certain the message will be json content, we can de-serialize it already
      const body = JSON.parse(msg.content.toString());

      // Since errors might happen we rap this in a try catch
      try {
        await onMessage(receivedType, body);
        this.rabbitChannel.ack(msg);
      } catch (e) {
        // An error occurred while handling this message,
        console.error(e);
      }
    });
  }
}
