import rabbit from "amqplib";
import { plainToInstance } from "class-transformer";
import { EventListener } from "perm-log-library/build/listener";
import {
  LogLevelEnum,
  PermCalculated,
  PermLogEventsEnum,
  PermRequested,
} from "perm-log-library/build/util";
import LogModel from "../schemas/log.schema";
import { getAwareLogger } from "../util/aware-logger";
import { SeverityNumber } from "@opentelemetry/api-logs";

const logger = getAwareLogger("log.service");

class LogService {
  constructor() {}

  async onQueueMessage(message: rabbit.ConsumeMessage) {
    try {
      const content = JSON.parse(message.content.toString()) as {};

      switch (message.fields.routingKey) {
        case PermLogEventsEnum.PermRequested:
          const { permNumber, reqContext } = plainToInstance(
            PermRequested,
            content
          );
          await LogModel.create({
            level: LogLevelEnum.Info,
            messageType: PermLogEventsEnum.PermRequested,
            permNumber,
            reqContext,
          });
          EventListener.acknowledgeMessage(message);
          break;
        case PermLogEventsEnum.PermCalculated:
          const { _id, permNumber: perm } = plainToInstance(
            PermCalculated,
            content
          );
          await LogModel.create({
            level: LogLevelEnum.Info,
            messageType: PermLogEventsEnum.PermCalculated,
            permId: _id,
            permNumber: perm,
          });
          EventListener.acknowledgeMessage(message);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error(error);
    }
  }

  async fetchLogs(limit: number, offset: number) {
    logger.emit({
      severityNumber: SeverityNumber.DEBUG,
      severityText: "DEBUG",
      body: "Fetching logs..",
      attributes: {
        limit,
        offset,
      },
    });

    const logs = await LogModel.find().limit(limit).skip(offset).exec();

    return logs.map((log) => log.toObject());
  }
}

export default new LogService();
