import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

const URI = process.env.Mongo_URI;

if (!URI) {
    console.error("Mongo URI is missing in .env file.");
    process.exit(1);
}

mongoose.connect(URI)
.then(()=>{console.log("MongoDb Connected")})
.catch(()=>console.log("MongoDb Error: Could not Connect"));

const mealSchema = new mongoose.Schema({
    // user_id:
    image_url:{type:String,required:true},
    date:{type:Date,required:true},
    calories:{type:Number, required:true}

});

const Meal = mongoose.model(mealSchema);

app.use(express.json());

app.get('/meals',async(req,res) =>{
    try{
        const meals = await Meal.find();
        res.json(meal);
    }
    catch(err){
        res.status(500).json({message: "Error Fetching Meals",error:err});
    }
    
}); //for History and photos.

app.post("/meals", async(req,res) =>{
    const {user_id, image_url, date, calories} = req.body;
    if(!user_id || !image_url || !date || !calories){
        return res.status(400).json({message:"All fields are Mandatory"});
    }
    try{
        const newMeal = new Meal({user_id,
            image_url,
            date,
            calories
        });
        await newMeal.save();
        res.status(201);
    }
    catch(err){
        res.status(500).json({message:"Error Incurred",error:err});
    }
});


app.listen(5000,() =>{
    console.log("Server is Listening at port 5000")
});