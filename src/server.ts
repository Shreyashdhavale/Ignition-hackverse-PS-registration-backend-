import "dotenv/config";
import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();
const port = Number(process.env.PORT ?? 5000);
const corsOrigin = process.env.CORS_ORIGIN ?? "http://localhost:3000";

app.use(cors({ origin: corsOrigin }));
app.use(express.json());

app.post("/register", async (req, res) => {
  try {
    const { teamName, registrationId, psId } = req.body;

    if (!teamName || !registrationId || !psId) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existing = await prisma.registration.findUnique({
      where: { registrationId },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "This Registration ID is already used",
      });
    }

    const newReg = await prisma.registration.create({
      data: {
        teamName,
        registrationId,
        psId,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      data: newReg,
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      return res.status(400).json({
        success: false,
        message: "Duplicate Registration ID",
      });
    }

    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

app.get("/stats", async (_req, res) => {
  try {
    const data = await prisma.registration.findMany({
      include: {
        problemStatement: true,
      },
    });

    const trackCount: Record<string, number> = {
      track1: 0,
      track2: 0,
      track3: 0,
      track4: 0,
    };

    data.forEach((item: { problemStatement: { track: number } }) => {
      const track = item.problemStatement.track;
      const key = `track${track}`;

      trackCount[key]++;
    });

    return res.json(trackCount);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error fetching stats",
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
