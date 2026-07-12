import dotenv from "dotenv";
dotenv.config();

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const models = [
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-2.5-flash-lite",
  "gemini-2.5-pro",
];

for (const m of models) {
  try {
    const model = genAI.getGenerativeModel({ model: m });

    const result = await model.generateContent("Say hello");

    console.log(`${m} ✅`);
    console.log(result.response.text());
  } catch (e) {
    console.log(`${m} ❌`);
    console.log(e.message);
  }
}
