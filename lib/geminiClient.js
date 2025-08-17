import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is missing in Backend/.env");
}

export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const DEFAULT_MODEL = "gemini-1.5-flash"; 
