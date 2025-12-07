import express from "express";
import dotenv from "dotenv";
import { color } from "console-log-colors";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "../routes/auth.route.js";
import messageRoutes from "../routes/message.route.js";

import { connectDB } from "../lib/db.js";
import { app, server } from "../lib/socket.js";

dotenv.config();


const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

function printBox(
  title,
  lines = [],
  borderColor = color.cyan,
  titleColor = color.yellow
) {
  const width = 68;
  const top = borderColor("┌" + "─".repeat(width) + "┐");
  const bottom = borderColor("└" + "─".repeat(width) + "┘");

  console.log("\n" + top);
  console.log(
    borderColor("│") +
      titleColor(`  ${title.padEnd(width - 2)} `) +
      borderColor("│")
  );

  lines.forEach((line) => {
    console.log(
      borderColor("│") +
        color.white(`  ${line.padEnd(width - 2)} `) +
        borderColor("│")
    );
  });

  console.log(bottom + "\n");
}

server.listen(process.env.PORT, async () => {
  printBox("⭐ SERVER STARTED ⭐", [
    `🔗 Listening on port: ${process.env.PORT}`,
  ]);

  try {
    await connectDB();

    // Print DATABASE box
    printBox("🗄️ DATABASE CONNECTED SUCCESSFULLY 🗄️", [
      "Status: OK",
      "Connection established.",
    ]);
  } catch (err) {
    printBox(
      "❌ DATABASE CONNECTION FAILED ❌",
      [`Error: ${err.message}`],
      color.red,
      color.red
    );
  }
});

