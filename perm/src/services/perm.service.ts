import { EnvVars, loadEnv } from "../util/parse-env";
import { PermComputeReqestDto } from "../dtos/perm-compute-request.dto";
import { Job, Queue, Worker } from "bullmq";
import Redis from "ioredis";
import { DELAY_QUEUE } from "../util/config";
import { plainToInstance } from "class-transformer";
import { validateDto } from "../util/func";

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

  permComputeRequested(dto: PermComputeReqestDto) {
    this.delayQueueProducer.add("perm", dto, {
      delay: (dto.computeDelay || 0) * 1000, // ms
    });

    console.log("published");

    // TODO: publish with rabbit
  }

  async onPermDelayCompleted(job: Job<any, any, string>) {
    console.log("RECEIVED MESSAGE");

    if (!job.data) return;

    try {
      const dto = plainToInstance(PermComputeReqestDto, job.data);
      validateDto(dto);

      console.log(dto);
    } catch (error) {}
  }
}

export default new PermService();
