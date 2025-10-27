import mongoose from "mongoose";

const mealSchema = new mongoose.Schema({
    // user_id:
    image_url:{type:String,required:true},
    date:{type:Date,required:true},
    calories:{type:String, required:true}

});


export default mongoose.model("Meal",mealSchema);
