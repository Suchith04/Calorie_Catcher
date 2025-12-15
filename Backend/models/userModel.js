import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    
    // Calorie Debt System
    calorieDebt: { type: Number, default: 0 },
    dailyCalorieTarget: { type: Number, default: 2000 },
    
    // Sleep Tracking
    lastSleepHours: { type: Number, default: 8 },
    adjustedCalorieTarget: { type: Number, default: 2000 },
    
    // Social Penalty System
    socialPenalties: [{
        date: Date,
        caloriesOver: Number,
        penaltyType: String, // 'charity', 'social_media_lock'
        status: { type: String, enum: ['pending', 'paid', 'active'], default: 'pending' },
        endDate: Date,
        amount: Number
    }],
    
    // Streaks and gamification
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    totalMeals: { type: Number, default: 0 },
    
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("User", userSchema);