import express from 'express';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import cors from "cors";
import mongoose from 'mongoose';
import mainRoutes from './routes/mainRoutes.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const URI = process.env.Mongo_URI;
const gemini_api = process.env.Gemini_API;

if (!URI || !gemini_api) {
    console.error("❌ Mongo URI or Gemini API is missing in .env file.");
    process.exit(1);
}

// Database Connection
async function connectDB() {
    try {
        await mongoose.connect(URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("✅ MongoDB Connected Successfully");
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error);
        process.exit(1);
    }
}

connectDB();

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

console.log("✅ Cloudinary Configured");

// Routes
app.use("", authRoutes);
app.use("", mainRoutes);

// Health Check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Calorie Catcher API is running',
        features: [
            'Calorie Debt System',
            'Social Penalty Game',
            'Sleep-Linked Auto-Calorie Adjustment'
        ]
    });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`🔥 Calorie Catcher API v2.0 with Debt System, Penalties & Sleep Tracking`);
});