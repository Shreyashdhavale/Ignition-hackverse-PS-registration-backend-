"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const queue_1 = require("./queue");
const prismaClient_1 = require("./prismaClient");
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
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
        // 🔥 STEP 1: GET PS
        const ps = await prismaClient_1.prisma.problemStatement.findUnique({
            where: { id: psId },
        });
        if (!ps) {
            return res.status(400).json({
                success: false,
                message: "Invalid PS ID",
            });
        }
        // 🔥 STEP 2: COUNT TRACK
        const count = await prismaClient_1.prisma.pSSelection.count({
            where: {
                problemStatement: {
                    track: ps.track,
                },
            },
        });
        // 🔥 STEP 3: BLOCK IF FULL
        if (count >= 18) {
            return res.status(400).json({
                success: false,
                message: "Track is full",
            });
        }
        // 🔥 STEP 4: ADD TO QUEUE
        const job = await queue_1.registrationQueue.add("register", {
            teamName,
            registrationId,
            psId,
        });
        return res.json({
            success: true,
            message: "Request added to queue",
            jobId: job.id,
        });
    }
    catch (error) {
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
        const result = {
            track1: 0,
            track2: 0,
            track3: 0,
            track4: 0,
        };
        const selections = await prismaClient_1.prisma.pSSelection.findMany({
            include: {
                problemStatement: true,
            },
        });
        selections.forEach((s) => {
            const key = `track${s.problemStatement.track}`;
            result[key]++;
        });
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching stats" });
    }
});
app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
});
