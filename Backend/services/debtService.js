import User from '../models/userModel.js';
import Meal from '../models/mealModel.js';
import Activity from '../models/activityModel.js';

class DebtService {
    // Calculate daily calorie intake vs target
    static async calculateDailyBalance(userId, date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');

        // Get total calories consumed today
        const mealsAgg = await Meal.aggregate([
            {
                $match: {
                    user_id: userId,
                    date: { $gte: startOfDay, $lte: endOfDay }
                }
            },
            {
                $group: {
                    _id: null,
                    totalCalories: { $sum: '$calories' }
                }
            }
        ]);

        const totalConsumed = mealsAgg[0]?.totalCalories || 0;
        const target = user.adjustedCalorieTarget;
        const balance = totalConsumed - target;

        return {
            consumed: totalConsumed,
            target,
            balance,
            isOverTarget: balance > 0
        };
    }

    // Update user's calorie debt
    static async updateDebt(userId, calorieAmount, isRepayment = false) {
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');

        if (isRepayment) {
            user.calorieDebt = Math.max(0, user.calorieDebt - calorieAmount);
        } else {
            user.calorieDebt += calorieAmount;
        }

        await user.save();
        return user.calorieDebt;
    }

    // Calculate exercise needed to clear debt
    static calculateDebtClearanceExercise(calorieDebt) {
        const exercises = [
            { name: 'Walking (moderate pace)', caloriesPerMin: 4, duration: Math.ceil(calorieDebt / 4) },
            { name: 'Running (6 mph)', caloriesPerMin: 10, duration: Math.ceil(calorieDebt / 10) },
            { name: 'Cycling (moderate)', caloriesPerMin: 8, duration: Math.ceil(calorieDebt / 8) },
            { name: 'Swimming', caloriesPerMin: 9, duration: Math.ceil(calorieDebt / 9) },
            { name: 'Yoga', caloriesPerMin: 3, duration: Math.ceil(calorieDebt / 3) }
        ];

        return exercises;
    }

    // Get user debt summary
    static async getDebtSummary(userId) {
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');

        const exercises = this.calculateDebtClearanceExercise(user.calorieDebt);
        const todayBalance = await this.calculateDailyBalance(userId, new Date());

        return {
            currentDebt: user.calorieDebt,
            todayBalance,
            suggestedExercises: exercises,
            status: user.calorieDebt === 0 ? 'clear' : user.calorieDebt > 1000 ? 'high' : 'manageable'
        };
    }
}

export default DebtService;