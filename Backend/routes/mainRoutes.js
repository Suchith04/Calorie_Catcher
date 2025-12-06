import express from "express";
import Meal from "../models/mealModel.js";
import Activity from "../models/activityModel.js";
import User from "../models/userModel.js";
import multer from "multer";
import fs from 'fs';
import callModel from "../callModel.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { v2 as cloudinary } from 'cloudinary';
import DebtService from "../services/debtService.js";
import PenaltyService from "../services/penaltyService.js";
import SleepService from "../services/sleepService.js";
import StatsService from "../services/statsService.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Get Dashboard Statistics
router.get('/api/dashboard', authMiddleware, async (req, res) => {
    try {
        const stats = await StatsService.getDashboardStats(req.user.id);
        const debtSummary = await DebtService.getDebtSummary(req.user.id);
        const sleepStats = await SleepService.getSleepStats(req.user.id);
        const penalties = await PenaltyService.getPendingPenalties(req.user.id);

        res.json({
            stats,
            debt: debtSummary,
            sleep: sleepStats,
            penalties
        });
    } catch (err) {
        res.status(500).json({ message: "Error fetching dashboard", error: err.message });
    }
});

// Get Meals History
router.get('/api/meals', authMiddleware, async (req, res) => {
    try {
        const meals = await Meal.find({ user_id: req.user.id })
            .sort({ date: -1 })
            .limit(50);
        res.json(meals);
    } catch (err) {
        res.status(500).json({ message: "Error fetching meals", error: err.message });
    }
});

// Upload Meal with JSON-based AI Analysis
router.post("/api/meals", authMiddleware, upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No image uploaded" });
        }

        console.log("📸 Starting meal upload process...");

        // Upload to Cloudinary
        const cloudinaryResult = await cloudinary.uploader.upload(req.file.path, {
            folder: "calorie_app",
        });
        const image_url = cloudinaryResult.secure_url;
        console.log("☁️ Image uploaded to Cloudinary:", image_url);

        // Read image and convert to base64
        const imageBuffer = fs.readFileSync(req.file.path);
        const base64Image = imageBuffer.toString("base64");

        // Call AI model for JSON analysis
        console.log("🤖 Analyzing image with Gemini AI...");
        const aiResult = await callModel(base64Image, process.env.Gemini_API);

        // Delete temporary file
        fs.unlink(req.file.path, (err) => {
            if (err) console.error("Error deleting temp file:", err);
        });

        // Extract structured data from JSON response
        const { fullAnalysis, structured } = aiResult;
        const calories = structured.totalCalories || 0;

        console.log("✅ AI Analysis Complete:", {
            calories,
            foodItems: structured.foodItems.length,
            confidence: structured.confidence,
            protein: structured.macronutrients.protein,
            carbs: structured.macronutrients.carbs,
            fats: structured.macronutrients.fats
        });

        // Get user's current target
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check daily balance
        const balance = await DebtService.calculateDailyBalance(req.user.id, new Date());
        
        // Calculate if this meal contributed to debt
        let contributedToDebt = 0;
        let withinTarget = true;
        
        if (balance.consumed + calories > user.adjustedCalorieTarget) {
            const overage = (balance.consumed + calories) - user.adjustedCalorieTarget;
            contributedToDebt = Math.max(0, overage);
            withinTarget = false;
        }

        console.log("📊 Balance Check:", {
            consumed: balance.consumed,
            newMeal: calories,
            total: balance.consumed + calories,
            target: user.adjustedCalorieTarget,
            overage: contributedToDebt,
            withinTarget
        });

        // Create meal document with JSON-structured data
        const newMeal = new Meal({
            user_id: req.user.id,
            image_url,
            date: new Date(),
            calories,
            mealType: req.body.mealType || undefined, // Will auto-detect if not provided
            foodItems: structured.foodItems, // Array of {name, portion, calories}
            macronutrients: structured.macronutrients,
            contributedToDebt,
            withinTarget,
            analysisText: fullAnalysis,
            confidence: structured.confidence,
            healthNotes: structured.healthNotes
        });

        await newMeal.save();
        console.log("💾 Meal saved to database");

        // Update user's total meals counter
        user.totalMeals += 1;
        await user.save();

        // Check if need to update debt
        let penalty = null;
        if (!withinTarget) {
            console.log("⚠️ Updating calorie debt...");
            await DebtService.updateDebt(req.user.id, contributedToDebt);
            
            // Check if penalty should be created
            penalty = await PenaltyService.createPenalty(req.user.id, contributedToDebt);
            if (penalty) {
                console.log("🚨 Penalty created:", penalty.penaltyType);
            }
        }

        // Prepare response
        const response = {
            message: withinTarget ? "Meal added successfully ✅" : "Meal added - calorie debt updated ⚠️",
            meal: {
                id: newMeal._id,
                image_url: newMeal.image_url,
                date: newMeal.date,
                calories: newMeal.calories,
                mealType: newMeal.mealType,
                confidence: newMeal.confidence
            },
            analysis: {
                fullText: fullAnalysis,
                calories,
                foodItems: structured.foodItems,
                macronutrients: structured.macronutrients,
                confidence: structured.confidence,
                healthNotes: structured.healthNotes
            },
            balance: {
                consumed: balance.consumed + calories,
                target: user.adjustedCalorieTarget,
                remaining: user.adjustedCalorieTarget - (balance.consumed + calories),
                percentage: Math.round(((balance.consumed + calories) / user.adjustedCalorieTarget) * 100)
            }
        };

        // Add warning and penalty info if over target
        if (!withinTarget) {
            response.warning = `⚠️ You've exceeded your target by ${Math.round(contributedToDebt)} calories today`;
            response.debtAdded = contributedToDebt;
            response.totalDebt = user.calorieDebt;
            
            if (penalty) {
                response.penalty = {
                    type: penalty.penaltyType,
                    amount: penalty.amount,
                    caloriesOver: penalty.caloriesOver,
                    message: penalty.penaltyType === 'charity' 
                        ? `💰 Charity penalty: Donate $${penalty.amount}`
                        : `🔒 Social media lock penalty: ${Math.ceil((penalty.endDate - new Date()) / (1000 * 60 * 60 * 24))} days`
                };
            }
        }

        console.log("✅ Meal upload complete!");
        res.status(201).json(response);

    } catch (err) {
        console.error("❌ Error in meal upload:", err);
        res.status(500).json({ 
            message: "Error adding meal", 
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});

// Log Activity
router.post('/api/activities', authMiddleware, async (req, res) => {
    try {
        const { activityType, duration, caloriesBurned, notes } = req.body;

        if (!activityType || !duration || !caloriesBurned) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const activity = new Activity({
            user_id: req.user.id,
            activityType,
            duration: parseInt(duration),
            caloriesBurned: parseInt(caloriesBurned),
            notes
        });

        await activity.save();

        // Repay debt with burned calories
        const newDebt = await DebtService.updateDebt(req.user.id, caloriesBurned, true);
        activity.debtRepaid = caloriesBurned;
        await activity.save();

        res.status(201).json({
            message: "Activity logged successfully",
            activity,
            debtRepaid: caloriesBurned,
            remainingDebt: newDebt,
            summary: `🎉 Great job! You've repaid ${caloriesBurned} calories from your debt.`
        });
    } catch (err) {
        res.status(500).json({ message: "Error logging activity", error: err.message });
    }
});

// Get Activities
router.get('/api/activities', authMiddleware, async (req, res) => {
    try {
        const activities = await Activity.find({ user_id: req.user.id })
            .sort({ date: -1 })
            .limit(20);
        res.json(activities);
    } catch (err) {
        res.status(500).json({ message: "Error fetching activities", error: err.message });
    }
});

// Update Sleep
router.post('/api/sleep', authMiddleware, async (req, res) => {
    try {
        const { sleepHours } = req.body;
        
        if (sleepHours === undefined || sleepHours < 0 || sleepHours > 24) {
            return res.status(400).json({ message: "Invalid sleep hours" });
        }

        const result = await SleepService.updateSleep(req.user.id, sleepHours);
        
        res.json({
            ...result,
            message: "Sleep updated successfully"
        });
    } catch (err) {
        res.status(500).json({ message: "Error updating sleep", error: err.message });
    }
});

// Get Calorie Trend
router.get('/api/trends', authMiddleware, async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 14;
        const trend = await StatsService.getCalorieTrend(req.user.id, days);
        res.json(trend);
    } catch (err) {
        res.status(500).json({ message: "Error fetching trends", error: err.message });
    }
});

// Get Meal Distribution
router.get('/api/meal-distribution', authMiddleware, async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const distribution = await StatsService.getMealDistribution(req.user.id, days);
        res.json(distribution);
    } catch (err) {
        res.status(500).json({ message: "Error fetching distribution", error: err.message });
    }
});

// Complete Penalty
router.post('/api/penalties/:id/complete', authMiddleware, async (req, res) => {
    try {
        const penalty = await PenaltyService.completePenalty(req.user.id, req.params.id);
        
        if (!penalty) {
            return res.status(404).json({ message: "Penalty not found" });
        }

        res.json({ 
            message: "Penalty marked as completed", 
            penalty,
            congratulations: "✅ Well done! You've completed your penalty."
        });
    } catch (err) {
        res.status(500).json({ message: "Error completing penalty", error: err.message });
    }
});

// Get User Profile
router.get('/api/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Error fetching profile", error: err.message });
    }
});

// Update User Settings
router.patch('/api/profile', authMiddleware, async (req, res) => {
    try {
        const { dailyCalorieTarget } = req.body;
        
        const user = await User.findById(req.user.id);
        
        if (dailyCalorieTarget) {
            user.dailyCalorieTarget = dailyCalorieTarget;
            user.adjustedCalorieTarget = dailyCalorieTarget;
        }
        
        await user.save();
        
        res.json({ 
            message: "Profile updated successfully",
            user: { 
                dailyCalorieTarget: user.dailyCalorieTarget,
                adjustedCalorieTarget: user.adjustedCalorieTarget
            }
        });
    } catch (err) {
        res.status(500).json({ message: "Error updating profile", error: err.message });
    }
});

export default router;