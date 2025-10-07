import request from "supertest";
import { PermComputeReqestDto } from "../../dtos/perm-compute-request.dto";
import server from "../../server";
import { StatusCodes } from "http-status-codes";
import permService from "../../services/perm.service";
import { Job, Queue } from "bullmq";
import { X_REQUEST_ID } from "perm-log-library/build/util";
import PermModel from "../../schemas/perm.schema";
import { EventPublisher } from "perm-log-library/build/publisher";

beforeAll(() => {
  jest.resetAllMocks();
  jest.clearAllMocks();
});

jest.mock("perm-log-library/build/publisher", () => ({
  EventPublisher: {
    init: jest.fn(),
    publishMessage: jest.fn(),
  },
}));

jest.mock("ioredis", () => {
  return function () {
    return {
      on: jest.fn(),
    };
  };
});

let permComputeRequestedSpy: jest.SpyInstance;
let permModelCreateSpy: jest.SpyInstance;
let delayQueueProducerAddSpy: jest.SpyInstance;

beforeEach(() => {
  jest.clearAllMocks();
  jest.resetAllMocks();

  permComputeRequestedSpy = jest.spyOn(permService, "permComputeRequested");
  permModelCreateSpy = jest.spyOn(PermModel, "create");
  delayQueueProducerAddSpy = jest.spyOn(
    (permService as any).delayQueueProducer as Queue,
    "add"
  );
});

afterEach(() => {
  permComputeRequestedSpy.mockRestore();
  permModelCreateSpy.mockRestore();
  delayQueueProducerAddSpy.mockRestore();
});

jest.mock("bullmq", () => ({
  Queue: jest.fn(() => ({
    add: () => {
      const dto = permComputeRequestedSpy.mock
        .calls[0][1] as PermComputeReqestDto;
      setTimeout(() => {
        permService.onPermDelayCompleted({ data: dto } as Job);
      }, (dto.computeDelay || 0) * 1000);
    },
  })),
  Worker: jest.fn(),
}));

const app = server();

describe("POST /compute", () => {
  it("fetches all perms", async () => {
    const reqBody = {
      term: 1,
      computeDelay: 2,
    } as PermComputeReqestDto;

    // send perm
    const res = await request(await app)
      .post("/compute")
      .set("Content-Type", "application/json")
      .accept("application/json")
      .send(reqBody);

    // delay - wait till the time the data is meant to have been saved
    await new Promise<boolean>((resolve, reject) => {
      setTimeout(() => {
        resolve(true);
      }, (reqBody.computeDelay || 0) * 1000);
    });

    expect(delayQueueProducerAddSpy).toHaveBeenCalled();
    expect(res.status).toBe(StatusCodes.CREATED);
  });
});

describe("GET /compute", () => {
  it("save and retrieve perm", async () => {
    const reqBody = {
      term: 1,
      computeDelay: 1,
    } as PermComputeReqestDto;

    // save perm
    await request(await app)
      .post("/compute")
      .set("Content-Type", "application/json")
      .accept("application/json")
      .send(reqBody);

    // delay - wait till the time the data is meant to have been saved
    await new Promise<boolean>((resolve, reject) => {
      setTimeout(() => {
        resolve(true);
      }, (reqBody.computeDelay || 0) * 1000);
    });

    // fetch messages
    const res = await request(await app).get("/compute");

    expect(permModelCreateSpy).toHaveBeenCalled();
    expect(EventPublisher.publishMessage).toHaveBeenCalled();
    expect(res.status).toBe(StatusCodes.OK);
    expect(res.headers[X_REQUEST_ID]).toBeDefined();
    expect(Array.isArray(res.body.data) && res.body.data?.length === 1).toBe(
      true
    );
  });
});
