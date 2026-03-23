// prisma/seed.js

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const data = [
    { id: "PS0101", track: 1, psNumber: 1, title: "Smart Waste Management System" },
    { id: "PS0102", track: 1, psNumber: 2, title: "AI-Based Traffic Control" },
    { id: "PS0103", track: 1, psNumber: 3, title: "Water Leakage Detection System" },
    { id: "PS0104", track: 1, psNumber: 4, title: "Smart Parking Solution" },
    { id: "PS0105", track: 1, psNumber: 5, title: "IoT-Based Air Quality Monitoring" },

    { id: "PS0201", track: 2, psNumber: 1, title: "Healthcare Appointment System" },
    { id: "PS0202", track: 2, psNumber: 2, title: "AI Chatbot for Mental Health" },
    { id: "PS0203", track: 2, psNumber: 3, title: "Remote Patient Monitoring App" },
    { id: "PS0204", track: 2, psNumber: 4, title: "Medicine Reminder System" },
    { id: "PS0205", track: 2, psNumber: 5, title: "Disease Prediction Using ML" },

    { id: "PS0301", track: 3, psNumber: 1, title: "E-Learning Platform with AI" },
    { id: "PS0302", track: 3, psNumber: 2, title: "Online Exam Proctoring System" },
    { id: "PS0303", track: 3, psNumber: 3, title: "Skill-Based Job Portal" },
    { id: "PS0304", track: 3, psNumber: 4, title: "Student Performance Analytics" },
    { id: "PS0305", track: 3, psNumber: 5, title: "Virtual Classroom with AR/VR" },

    { id: "PS0401", track: 4, psNumber: 1, title: "Fraud Detection in Banking" },
    { id: "PS0402", track: 4, psNumber: 2, title: "Secure Online Voting System" },
    { id: "PS0403", track: 4, psNumber: 3, title: "Blockchain-Based Supply Chain" },
    { id: "PS0404", track: 4, psNumber: 4, title: "Cybersecurity Threat Detection" },
    { id: "PS0405", track: 4, psNumber: 5, title: "Passwordless Authentication System" }
  ];

  await prisma.problemStatement.createMany({
    data,
    skipDuplicates: true,
  });

  console.log("✅ Dummy PS data inserted");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());