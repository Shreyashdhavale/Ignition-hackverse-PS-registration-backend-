"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registrationQueue = void 0;
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
const connection = new ioredis_1.default("rediss://default:gQAAAAAAAVz5AAIncDE3Y2U0NjMxODBlZGY0NDU3YmQxZmY3MTc3MzFmOWY3OXAxODkzMzc@humane-jennet-89337.upstash.io:6379", {
    maxRetriesPerRequest: null,
});
exports.registrationQueue = new bullmq_1.Queue("registration", {
    connection,
});
