import express from 'express';
import dotenv from 'dotenv';
import {v2 as cloudinary} from 'cloudinary';
import cors from "cors";
import db from './db.js';


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const URI = process.env.Mongo_URI;
const gemini_api = process.env.Gemini_API;

if (!URI || !gemini_api) {
    console.error("Mongo URI or API is missing in .env file.");
    process.exit(1);
}

db();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});


app.listen(5000,() =>{
    console.log("Server is Listening at port 5000")
});