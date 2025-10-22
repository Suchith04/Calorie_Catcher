import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import multer from 'multer';
import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';

dotenv.config();

const app = express();

const URI = process.env.Mongo_URI;

if (!URI) {
    console.error("Mongo URI is missing in .env file.");
    process.exit(1);
}

mongoose.connect(URI)
.then(()=>{console.log("MongoDb Connected")})
.catch((err)=>console.log("MongoDb Error: Could not Connect"));

const mealSchema = new mongoose.Schema({
    // user_id:
    image_url:{type:String,required:true},
    date:{type:Date,required:true},
    calories:{type:Number, required:true}

});

const Meal = mongoose.model("Meal",mealSchema);

app.use(express.json());

const upload = multer({ dest: "uploads/" }); // temporary upload folder

cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret,
});

app.get('/meals',async(req,res) =>{
    try{
        const meals = await Meal.find();
        res.json(meals);
    }
    catch(err){
        res.status(500).json({message: "Error Fetching Meals",error:err});
    }
    
}); //for History and photos.


app.post("/meals", upload.single("image"),async(req,res) =>{
    const {user_id, calories} = req.body;
    if(!user_id || !calories){
        return res.status(400).json({message:"All fields are Mandatory"});
    }
    try{
        
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "calorie_app", // optional: to organize uploads
        });

        const image_url = result.secure_url;
        const date = new Date();
        
        //Before Deleting this Image, Call The LLM or Agent 
        // Can Use Node MultiThreading but Heavy Computation and Latency
        // So Better Go With Python Multiprocessing (Flask Endpoint)
        
        fs.unlink(req.file.path, (err) => {
            if (err) console.error("Error deleting temp file:", err);
        });

        if(!image_url){
            return res.status(400).json({message: "Cloudinary Upload Failed"});
        }

        
        const newMeal = new Meal({user_id,
            image_url,
            date,
            calories
        });
        await newMeal.save();
        res.status(201).json({message:"Added Successfully"});
    }
    catch(err){
        res.status(500).json({message:"Error Incurred",error:err});
    }
});


app.listen(5000,() =>{
    console.log("Server is Listening at port 5000")
});