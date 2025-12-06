import User from '../models/userModel.js';

class SleepService {
    // Update sleep hours and adjust calorie target
    static async updateSleep(userId, sleepHours) {
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');

        user.lastSleepHours = sleepHours;

        // Calculate adjusted calorie target based on sleep
        const optimalSleep = 8;
        const sleepDeficit = Math.max(0, optimalSleep - sleepHours);
        
        // For every hour of sleep lost, reduce target by 100 calories
        // This accounts for reduced metabolic rate and stress on the body
        const adjustment = sleepDeficit * 100;
        
        user.adjustedCalorieTarget = user.dailyCalorieTarget - adjustment;
        
        await user.save();

        return {
            sleepHours,
            sleepDeficit,
            originalTarget: user.dailyCalorieTarget,
            adjustedTarget: user.adjustedCalorieTarget,
            adjustment,
            recommendation: this.getSleepRecommendation(sleepHours)
        };
    }

    // Get sleep-based recommendations
    static getSleepRecommendation(sleepHours) {
        if (sleepHours >= 8) {
            return 'Excellent! Your calorie target remains unchanged.';
        } else if (sleepHours >= 6) {
            return 'Moderate sleep deficit. Target reduced to help your recovery.';
        } else if (sleepHours >= 4) {
            return 'Significant sleep deficit. Focus on rest and lighter meals today.';
        } else {
            return 'Severe sleep deficit. Priority should be rest. Calorie target heavily reduced.';
        }
    }

    // Get sleep statistics
    static async getSleepStats(userId) {
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');

        return {
            lastSleepHours: user.lastSleepHours,
            currentTarget: user.adjustedCalorieTarget,
            baseTarget: user.dailyCalorieTarget,
            isAdjusted: user.adjustedCalorieTarget !== user.dailyCalorieTarget,
            sleepQuality: user.lastSleepHours >= 7 ? 'Good' : user.lastSleepHours >= 5 ? 'Fair' : 'Poor'
        };
    }
}

export default SleepService;