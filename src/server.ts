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
app.post("/register", async (req, res) => {
  const { teamName, registrationId, psId } = req.body;

  if (!teamName || !registrationId || !psId) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  try {
    // ✅ STEP 1: VALIDATE PS
    const ps = await prisma.problemStatement.findUnique({
      where: { id: psId },
    });

    if (!ps) {
      return res.status(400).json({
        success: false,
        message: "Invalid PS ID",
      });
    }

    // ✅ STEP 2: CHECK TRACK LIMIT (PRE-CHECK)
    const count = await prisma.pSSelection.count({
      where: {
        problemStatement: {
          track: ps.track,
        },
      },
    });

    if (count >= 18) {
      return res.status(400).json({
        success: false,
        message: "Track is full",
      });
    }

    // ✅ STEP 3: ADD TO QUEUE
    const job = await registrationQueue.add("register", {
      teamName,
      registrationId,
      psId,
    });

    return res.json({
      success: true,
      message: "Request added to queue",
      jobId: job.id,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
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