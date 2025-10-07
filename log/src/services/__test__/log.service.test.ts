import rabbit from "amqplib";
import {
  LogLevelEnum,
  PermLogEventsEnum,
  PermRequested,
  RequestContextDto,
} from "perm-log-library/build/util";
import logService from "../log.service";
import LogModel from "../../schemas/log.schema";
import { EventListener } from "perm-log-library/build/listener";

jest.mock("perm-log-library/build/listener", () => ({
  EventListener: {
    acknowledgeMessage: jest.fn(),
  },
}));

jest.mock("../../schemas/log.schema", () => {
  let result: [] | undefined = undefined;

  return {
    create: jest.fn(),
    find: () => {
      result = [];
      return {
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        exec: jest.fn().mockImplementation(() => result),
      };
    },
  };
});

beforeEach(() => {
  jest.clearAllMocks();
  jest.resetAllMocks();
});

describe("onQueueMessage()", () => {
  describe("valid message", () => {
    it("creates message in db and acknowledge", async () => {
      const exchange = "test-exchange";
      const routingKey = PermLogEventsEnum.PermRequested;
      const permNumber = 1;
      const delay = 1;
      const reqContext = {} as RequestContextDto;

      const content = Buffer.from(
        JSON.stringify(
          new PermRequested({
            permNumber,
            delay,
            reqContext,
          })
        )
      );
      const message = {
        content,
        fields: {
          routingKey,
          exchange,
        },
      } as rabbit.ConsumeMessage;

      await logService.onQueueMessage(message);

      expect(LogModel.create).toHaveBeenCalledWith({
        level: LogLevelEnum.Info,
        messageType: routingKey,
        permNumber,
        reqContext,
      });
      expect(EventListener.acknowledgeMessage).toHaveBeenCalledWith(message);
    });
  });

  describe("invalid routing key", () => {
    it("it does not create messsage in db, nor acknowledge", async () => {
      const exchange = "test-exchange";
      const routingKey = "";
      const permNumber = 1;
      const delay = 1;
      const reqContext = {} as RequestContextDto;

      const content = Buffer.from(
        JSON.stringify(
          new PermRequested({
            permNumber,
            delay,
            reqContext,
          })
        )
      );
      const message = {
        content,
        fields: {
          routingKey,
          exchange,
        },
      } as rabbit.ConsumeMessage;

      await logService.onQueueMessage(message);

      expect(LogModel.create).not.toHaveBeenCalled();
      expect(EventListener.acknowledgeMessage).not.toHaveBeenCalled();
    });
  });
});

describe("fetchLogs()", () => {
  it("fetches logs", async () => {
    const limit = 1;
    const offset = 0;

    const res = await logService.fetchLogs(limit, offset);

    expect(Array.isArray(res)).toBe(true);
  });
});
