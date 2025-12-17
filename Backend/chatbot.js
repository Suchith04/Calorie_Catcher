import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";

dotenv.config();
const app = express();
const PORT =  5000;

app.use(cors());
app.use(express.json());




app.listen(PORT, () => console.log(`Server running on port ${PORT}`));