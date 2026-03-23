import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

const MAX_TOTAL = 80;
const MAX_PER_TRACK = 25;

app.post("/register", async (req, res) => {
  try {
    const { teamName, registrationId, psId } = req.body;

    // 🔒 Basic validation
    if (!teamName || !registrationId || !psId) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // 🔍 Check duplicate FIRST
    const existing = await prisma.registration.findUnique({
      where: { registrationId },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "❌ This Registration ID is already used",
      });
    }

    // ✅ Create registration
    const newReg = await prisma.registration.create({
      data: {
        teamName,
        registrationId,
        psId,
      },
    });

    return res.status(201).json({
      success: true,
      message: "✅ Registration successful",
      data: newReg,
    });

  } catch (error: any) {
    // 🔥 HANDLE DB UNIQUE ERROR (important)
    if (error.code === "P2002") {
      return res.status(400).json({
        success: false,
        message: "❌ Duplicate Registration ID",
      });
    }

    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// 📊 Track stats
app.get("/stats", async (req, res) => {
  try {
    const data = await prisma.registration.findMany({
      include: {
        problemStatement: true,
      },
    });

    // 🔥 Initialize all tracks (important)
    const trackCount: Record<string, number> = {
      track1: 0,
      track2: 0,
      track3: 0,
      track4: 0,
    };

    // ✅ Count registrations
    data.forEach((item: { problemStatement: { track: any; }; }) => {
      const track = item.problemStatement.track;
      const key = `track${track}`;

      trackCount[key]++;
    });

    res.json(trackCount);

  } catch (error) {
    res.status(500).json({
      message: "Error fetching stats",
    });
  }
});

app.listen(5000, () => {
  console.log("Server running 🚀");
});