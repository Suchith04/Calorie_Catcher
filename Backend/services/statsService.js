import Meal from '../models/mealModel.js';
import Activity from '../models/activityModel.js';
import User from '../models/userModel.js';
import mongoose from 'mongoose';

class StatsService {
    // Get comprehensive dashboard statistics
    static async getDashboardStats(userId) {
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        // Today's meals
        const todayMeals = await Meal.aggregate([
            {
                $match: {
                    user_id: new mongoose.Types.ObjectId(userId),
                    date: { $gte: today, $lte: todayEnd }
                }
            },
            {
                $group: {
                    _id: null,
                    totalCalories: { $sum: '$calories' },
                    mealCount: { $sum: 1 }
                }
            }
        ]);

        // This week's data
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - 7);
        
        const weeklyMeals = await Meal.aggregate([
            {
                $match: {
                    user_id: new mongoose.Types.ObjectId(userId),
                    date: { $gte: weekStart }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
                    dailyCalories: { $sum: '$calories' }
                }
            },
            {
                $group: {
                    _id: null,
                    avgCalories: { $avg: '$dailyCalories' },
                    days: { $sum: 1 }
                }
            }
        ]);

        // Activities this week
        const weeklyActivities = await Activity.aggregate([
            {
                $match: {
                    user_id: new mongoose.Types.ObjectId(userId),
                    date: { $gte: weekStart }
                }
            },
            {
                $group: {
                    _id: null,
                    totalBurned: { $sum: '$caloriesBurned' },
                    totalMinutes: { $sum: '$duration' },
                    activityCount: { $sum: 1 }
                }
            }
        ]);

        return {
            today: {
                calories: todayMeals[0]?.totalCalories || 0,
                mealCount: todayMeals[0]?.mealCount || 0,
                target: user.adjustedCalorieTarget,
                remaining: user.adjustedCalorieTarget - (todayMeals[0]?.totalCalories || 0)
            },
            week: {
                avgCalories: Math.round(weeklyMeals[0]?.avgCalories || 0),
                daysTracked: weeklyMeals[0]?.days || 0,
                totalBurned: weeklyActivities[0]?.totalBurned || 0,
                totalExerciseMinutes: weeklyActivities[0]?.totalMinutes || 0,
                activitiesLogged: weeklyActivities[0]?.activityCount || 0
            },
            user: {
                streak: user.currentStreak,
                totalMeals: user.totalMeals,
                debt: user.calorieDebt
            }
        };
    }

    // Get meal distribution by type
    static async getMealDistribution(userId, days = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const distribution = await Meal.aggregate([
            {
                $match: {
                    user_id: new mongoose.Types.ObjectId(userId),
                    date: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: '$mealType',
                    count: { $sum: 1 },
                    avgCalories: { $avg: '$calories' },
                    totalCalories: { $sum: '$calories' }
                }
            }
        ]);

        return distribution;
    }

    // Get calorie trend over time
    static async getCalorieTrend(userId, days = 14) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const trend = await Meal.aggregate([
            {
                $match: {
                    user_id: new mongoose.Types.ObjectId(userId),
                    date: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
                    calories: { $sum: '$calories' }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        return trend;
    }
}

export default StatsService;