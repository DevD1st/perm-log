import request from "supertest";
import server from "../../server";
import { StatusCodes } from "http-status-codes";
import { EventListener } from "perm-log-library/build/listener";
import rabbit from "amqplib";
import {
  PermLogEventsEnum,
  PermRequested,
  RequestContextDto,
  X_REQUEST_ID,
} from "perm-log-library/build/util";

jest.mock("perm-log-library/build/listener", () => ({
  EventListener: {
    init: jest.fn(),
    acknowledgeMessage: jest.fn(),
  },
}));

const app = server();

describe("/all", () => {
  it("fetches all logs", async () => {
    // save 1 message
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

    const messageListener = (EventListener.init as jest.Mock).mock.calls[0][3];
    messageListener(message);

    // fetch messages
    const res = await request(await app).get("/all");

    expect(res.status).toBe(StatusCodes.OK);
    expect(res.headers[X_REQUEST_ID]).toBeDefined();
    expect(Array.isArray(res.body.data) && res.body.data?.length === 1).toBe(
      true
    );
  });
});
