import "dotenv/config";
import express from "express";
import cors from "cors";
import { registrationQueue } from "./queue";
import { prisma } from "./prismaClient";

// 🔥 IMPORTANT: START WORKER INSIDE SERVER
import "./worker";

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: "*", // ⚠️ change to your Vercel URL later
}));

app.use(express.json());

/**
 * 🚀 REGISTER (QUEUE BASED)
 */
import { QueueEvents } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
});
const queueEvents = new QueueEvents("registration", { connection });

app.post("/register", async (req, res) => {
  const { teamName, registrationId, psId } = req.body;

  if (!teamName || !registrationId || !psId) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  try {
    // ✅ PS check
    const ps = await prisma.problemStatement.findUnique({
      where: { id: psId },
    });

    if (!ps) {
      return res.status(400).json({
        success: false,
        message: "Invalid PS ID",
      });
    }

    // ✅ Add job
    const job = await registrationQueue.add("register", {
      teamName,
      registrationId,
      psId,
    });

    // 🔥 WAIT FOR RESULT
    const result = await job.waitUntilFinished(queueEvents);

    return res.json({
      success: true,
      message: "Registration successful",
    });

  } catch (error: any) {
    console.error(error);

    // 🔥 HANDLE WORKER ERRORS
    if (error.message === "TRACK_FULL") {
      return res.status(400).json({
        success: false,
        message: "Track is full",
      });
    }

    if (error.message === "ALREADY_SELECTED") {
      return res.status(400).json({
        success: false,
        message: "Already selected",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
});

/**
 * 📊 STATS API
 */
app.get("/stats", async (_req, res) => {
  try {
    const result: Record<string, number> = {
      track1: 0,
      track2: 0,
      track3: 0,
      track4: 0,
    };

    const selections = await prisma.pSSelection.findMany({
      include: {
        problemStatement: true,
      },
    });

    selections.forEach((s) => {
      const key = `track${s.problemStatement.track}`;
      result[key]++;
    });

    res.json(result);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching stats" });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server + Worker running on port ${port}`);
});