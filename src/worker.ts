import { Worker } from "bullmq";
import IORedis from "ioredis";
import { prisma } from "./prismaClient";

const connection = new IORedis(
  "rediss://default:gQAAAAAAAVz5AAIncDE3Y2U0NjMxODBlZGY0NDU3YmQxZmY3MTc3MzFmOWY3OXAxODkzMzc@humane-jennet-89337.upstash.io:6379",
  {
    maxRetriesPerRequest: null,
  }
);

const worker = new Worker(
  "registration",
  async (job) => {
    const { teamName, registrationId, psId } = job.data;

    await prisma.$transaction(async (tx) => {
      const team = await tx.teamRegistration.findUnique({
        where: { registrationId },
      });

      if (!team) throw new Error("INVALID_TEAM");

      const ps = await tx.problemStatement.findUnique({
        where: { id: psId },
      });

      if (!ps) throw new Error("INVALID_PS");

      const count = await tx.pSSelection.count({
        where: {
          problemStatement: { track: ps.track },
        },
      });

      if (count >= 18) throw new Error("TRACK_FULL");

      await tx.pSSelection.create({
        data: { registrationId, psId },
      });
    });
  },
  {
    connection,
    concurrency: 1, // 🔥 FCFS
  }
);

worker.on("completed", (job) => {
  console.log(`✅ Completed: ${job.id}`);
});

worker.on("failed", (job, err) => {
  console.log(`❌ Failed: ${job?.id} → ${err.message}`);
});