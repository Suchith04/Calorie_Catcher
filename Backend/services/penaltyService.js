import User from '../models/userModel.js';

class PenaltyService {
    // Create penalty when user exceeds calorie target significantly
    static async createPenalty(userId, caloriesOver) {
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');

        // Penalty thresholds
        if (caloriesOver < 500) return null; // No penalty for small overages

        let penaltyType, amount, durationDays;

        if (caloriesOver >= 800) {
            // Major overage: Social media lock
            penaltyType = 'social_media_lock';
            durationDays = Math.ceil(caloriesOver / 800);
            amount = 0;
        } else {
            // Medium overage: Charity donation
            penaltyType = 'charity';
            amount = Math.ceil(caloriesOver / 100) * 5; // $5 per 100 calories
            durationDays = 0;
        }

        const penalty = {
            date: new Date(),
            caloriesOver,
            penaltyType,
            status: 'pending',
            endDate: durationDays > 0 ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000) : null,
            amount
        };

        user.socialPenalties.push(penalty);
        await user.save();

        return penalty;
    }

    // Check and apply penalties
    static async checkPenalties(userId) {
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');

        const activePenalties = user.socialPenalties.filter(p => 
            p.status === 'active' && p.endDate && p.endDate > new Date()
        );

        return {
            hasActivePenalties: activePenalties.length > 0,
            penalties: activePenalties
        };
    }

    // Mark penalty as paid/completed
    static async completePenalty(userId, penaltyId) {
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');

        const penalty = user.socialPenalties.id(penaltyId);
        if (penalty) {
            penalty.status = 'paid';
            await user.save();
        }

        return penalty;
    }

    // Get all pending penalties
    static async getPendingPenalties(userId) {
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');

        return user.socialPenalties.filter(p => p.status === 'pending');
    }

    // Activate a penalty
    static async activatePenalty(userId, penaltyId) {
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');

        const penalty = user.socialPenalties.id(penaltyId);
        if (penalty) {
            penalty.status = 'active';
            await user.save();
        }

        return penalty;
    }
}

export default PenaltyService;