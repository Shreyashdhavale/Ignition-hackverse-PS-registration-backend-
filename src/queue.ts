import { Queue } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis(
  "rediss://default:gQAAAAAAAVz5AAIncDE3Y2U0NjMxODBlZGY0NDU3YmQxZmY3MTc3MzFmOWY3OXAxODkzMzc@humane-jennet-89337.upstash.io:6379",
  {
    maxRetriesPerRequest: null,
  }
);

export const registrationQueue = new Queue("registration", {
  connection,
});