import mongoose from "mongoose";

// Sub-schema for individual food items
const foodItemSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        trim: true
    },
    portion: { 
        type: String, 
        required: true,
        trim: true
    },
    calories: { 
        type: Number, 
        required: true,
        min: 0
    }
}, { _id: false });

const mealSchema = new mongoose.Schema({
    // User reference
    user_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true,
        index: true
    },
    
    // Basic meal info
    image_url: { 
        type: String, 
        required: true 
    },
    date: { 
        type: Date, 
        required: true,
        default: Date.now,
        index: true
    },
    
    // Calorie information
    calories: { 
        type: Number, 
        required: true,
        min: 0
    },
    
    // Meal classification
    mealType: { 
        type: String, 
        enum: ['breakfast', 'lunch', 'dinner', 'snack'], 
        default: 'snack',
        index: true
    },
    
    // Detailed food items with portions and calories (from JSON)
    foodItems: [foodItemSchema],
    
    // Macronutrient breakdown
    macronutrients: {
        protein: { type: Number, default: 0, min: 0 }, // in grams
        carbs: { type: Number, default: 0, min: 0 },   // in grams
        fats: { type: Number, default: 0, min: 0 }     // in grams
    },
    
    // Debt tracking for this meal
    contributedToDebt: { 
        type: Number, 
        default: 0,
        min: 0
    },
    
    // Was this meal within target?
    withinTarget: {
        type: Boolean,
        default: true
    },
    
    // AI analysis details
    analysisText: {
        type: String,
        required: true
    },
    
    // Confidence level from AI
    confidence: {
        type: String,
        enum: ['High', 'Medium', 'Low'],
        default: 'Medium'
    },
    
    // Health notes from AI
    healthNotes: {
        type: String,
        default: ''
    },
    
    // Metadata
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
}, {
    timestamps: true
});

// Indexes for common queries
mealSchema.index({ user_id: 1, date: -1 });
mealSchema.index({ user_id: 1, mealType: 1 });
mealSchema.index({ user_id: 1, contributedToDebt: -1 });

// Virtual for calorie per gram of macros
mealSchema.virtual('estimatedCaloriesFromMacros').get(function() {
    const { protein, carbs, fats } = this.macronutrients;
    return (protein * 4) + (carbs * 4) + (fats * 9);
});

// Method to check if meal is high calorie
mealSchema.methods.isHighCalorie = function() {
    return this.calories > 600;
};

// Static method to get meal stats for a user
mealSchema.statics.getUserMealStats = async function(userId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return await this.aggregate([
        {
            $match: {
                user_id: new mongoose.Types.ObjectId(userId),
                date: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: null,
                totalMeals: { $sum: 1 },
                totalCalories: { $sum: '$calories' },
                avgCalories: { $avg: '$calories' },
                totalDebtContributed: { $sum: '$contributedToDebt' },
                highConfidenceMeals: {
                    $sum: { $cond: [{ $eq: ['$confidence', 'High'] }, 1, 0] }
                }
            }
        }
    ]);
};

// Pre-save middleware to determine meal type based on time if not set
mealSchema.pre('save', function(next) {
    if (!this.mealType || this.mealType === 'snack') {
        const hour = this.date.getHours();
        
        if (hour >= 5 && hour < 11) {
            this.mealType = 'breakfast';
        } else if (hour >= 11 && hour < 16) {
            this.mealType = 'lunch';
        } else if (hour >= 16 && hour < 22) {
            this.mealType = 'dinner';
        } else {
            this.mealType = 'snack';
        }
    }
    next();
});

export default mongoose.model("Meal", mealSchema);