import { EnvVars, loadEnv } from "../util/parse-env";
import { PermComputeReqestDto } from "../dtos/perm-compute-request.dto";
import { Job, Queue, Worker } from "bullmq";
import Redis from "ioredis";
import { DELAY_QUEUE } from "../util/config";
import { plainToInstance } from "class-transformer";
import { factorial, validateDto } from "../util/func";
import { EventPublisher } from "perm-log-library/build/publisher";
import {
  PermCalculated,
  PermLogEventsEnum,
  PermRequested,
  RequestContextDto,
} from "perm-log-library/build/util";
import PermModel from "../schemas/perm.schema";

loadEnv();

class PermService {
  private redisClient: Redis;
  private redisSubscriber: Redis;
  private delayQueueProducer: Queue;
  private delayQueueConsumer: Worker;

  constructor() {
    // configure redis
    this.redisClient = new Redis({
      port: EnvVars.REDIS_PORT,
      host: EnvVars.REDIS_HOSTNAME,
      maxLoadingRetryTime: undefined,
      maxRetriesPerRequest: null,
    });
    this.redisSubscriber = new Redis({
      port: EnvVars.REDIS_PORT,
      host: EnvVars.REDIS_HOSTNAME,
      maxLoadingRetryTime: undefined,
      maxRetriesPerRequest: null,
    });

    this.redisClient.on("error", (error) => {
      throw error;
    });
    this.redisSubscriber.on("error", (error) => {
      throw error;
    });

    // configure bull
    this.delayQueueProducer = new Queue(DELAY_QUEUE, {
      connection: this.redisClient,
    });
    this.delayQueueConsumer = new Worker(
      DELAY_QUEUE,
      this.onPermDelayCompleted,
      {
        connection: this.redisSubscriber,
      }
    );
  }

  permComputeRequested(
    reqContext: RequestContextDto,
    dto: PermComputeReqestDto
  ) {
    console.log("service");

    this.delayQueueProducer.add("perm", dto, {
      delay: (dto.computeDelay || 0) * 1000, // ms
    });

    EventPublisher.publishMessage(
      PermLogEventsEnum.PermRequested,
      Buffer.from(
        JSON.stringify(
          new PermRequested({
            permNumber: dto.term,
            delay: dto.computeDelay,
            reqContext,
          })
        )
      )
    );
  }

  async onPermDelayCompleted(job: Job<any, any, string>) {
    console.log("RECEIVED MESSAGE");

    if (!job.data) return;

    try {
      const dto = plainToInstance(PermComputeReqestDto, job.data);
      await validateDto(dto);
      const calculatedPerm = factorial(dto.term);

      const queryResult = await PermModel.create({
        permNumber: dto.term,
        appliedDelay: dto.computeDelay,
        calculatedFactorial: calculatedPerm,
      });

      const permObj = queryResult.toObject();

      EventPublisher.publishMessage(
        PermLogEventsEnum.PermCalculated,
        Buffer.from(JSON.stringify(new PermCalculated(permObj)))
      );
    } catch (error) {}
  }

  async fetchPerms(limit: number, offset: number) {
    const perms = await PermModel.find().limit(limit).skip(offset).exec();

    return perms.map((perm) => perm.toObject());
  }
}

export default new PermService();
