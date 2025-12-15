import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    activityType: { type: String, required: true },
    duration: { type: Number, required: true },
    caloriesBurned: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    debtRepaid: { type: Number, default: 0 },
    notes: String
});
export default mongoose.model("Activity", activitySchema);