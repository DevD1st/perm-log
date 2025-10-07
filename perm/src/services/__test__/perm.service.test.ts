import {
  PermLogEventsEnum,
  RequestContextDto,
} from "perm-log-library/build/util";
import permService from "../perm.service";
import { PermComputeReqestDto } from "../../dtos/perm-compute-request.dto";
import { Job, Queue } from "bullmq";
import { EventPublisher } from "perm-log-library/build/publisher";
import PermModel from "../../schemas/perm.schema";

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

jest.mock("bullmq", () => ({
  Queue: jest.fn(() => ({
    add: jest.fn(),
  })),
  Worker: jest.fn(),
}));

jest.mock("../../schemas/perm.schema", () => {
  let result: [] | undefined = undefined;

  return {
    create: () => ({ toObject: jest.fn().mockReturnValue({}) }),
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

afterAll(() => {
  jest.clearAllMocks();
  jest.resetAllMocks();
});

describe("permComputeRequested()", () => {
  it("it add task to queue and publishes a message", async () => {
    await permService.permComputeRequested(
      {} as RequestContextDto,
      {
        term: 1,
        computeDelay: 2,
      } as PermComputeReqestDto
    );

    expect(
      ((permService as any).delayQueueProducer as Queue).add
    ).toHaveBeenCalled();
    expect(EventPublisher.publishMessage).toHaveBeenCalled();
  });
});

describe("onPermDelayCompleted()", () => {
  let createInDbSpy: jest.SpyInstance;

  beforeEach(() => {
    createInDbSpy = jest.spyOn(PermModel, "create");
  });

  afterEach(() => {
    createInDbSpy.mockRestore();
  });

  describe("valid job", () => {
    it("publishes and creates in db", async () => {
      const job = {
        data: {
          term: 1,
          computeDelay: 2,
        } as PermComputeReqestDto,
      } as Job;

      await permService.onPermDelayCompleted(job);

      expect(createInDbSpy).toHaveBeenCalledWith(expect.any(Object));
      expect(EventPublisher.publishMessage).toHaveBeenCalledWith(
        PermLogEventsEnum.PermCalculated,
        expect.any(Buffer)
      );
    });
  });

  describe("invalid job", () => {
    it("does not try publishing or creating in db", async () => {
      permService.onPermDelayCompleted({} as Job);

      expect(PermModel.create).not.toHaveBeenCalled();
      expect(createInDbSpy).not.toHaveBeenCalled();
    });
  });
});

describe("fetchPerms()", () => {
  it("fetches perms", async () => {
    const limit = 1;
    const offset = 0;

    const res = await permService.fetchPerms(limit, offset);

    expect(Array.isArray(res)).toBe(true);
  });
});
