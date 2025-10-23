import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import multer from 'multer';
import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';
import callModel from './callModel.js';

dotenv.config();

const app = express();

const URI = process.env.Mongo_URI;
const gemini_api = process.env.Gemini_API;

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
    calories:{type:String, required:true}

});

const Meal = mongoose.model("Meal",mealSchema);

app.use(express.json());

const upload = multer({ dest: "uploads/" }); // temporary upload folder

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});


app.get('/', (req,res) =>{
    res.json({message :"just a testing message"});
})

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
    
    // const {user_id, calories} = req.body;
    // if(!user_id ){
    //     return res.status(400).json({message:"All fields are Mandatory"});
    // }

    const user_id = 1;

    try{
        if (!req.file) {
            return res.status(400).json({ message: "No image uploaded" });
        }


        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "calorie_app",
        });

        const image_url = result.secure_url;
        const date = new Date();
        
        //Before Deleting this Image, Call The LLM or Agent 
        // 1. Can Use Node MultiThreading but Heavy Computation and Latency
        // So Better Go With Python Multiprocessing (Flask Endpoint)
        
        // 2. Can Directly Use HuggingFace Inference Api
        // 3. Call Agentic AI

        

        if(!image_url){
            return res.status(400).json({message: "Cloudinary Upload Failed"});
        }

        const imageBuffer = fs.readFileSync(req.file.path);
        const base64Image = imageBuffer.toString("base64");

        const EstimateCalories = await callModel(base64Image,gemini_api);
        
        // use regex to extract the calories 
        const match = EstimateCalories.match(/(\d+(\.\d+)?)\s*(kcal|calories?)/i);
        const calories = match ? parseFloat(match[1]) : 0;


        fs.unlink(req.file.path, (err) => {
            if (err) console.error("Error deleting temp file:", err);
        });
        
        const newMeal = new Meal({user_id,
            image_url,
            date,
            calories
        });
        await newMeal.save();
        res.status(201).json({message:"Added Successfully",
            response: EstimateCalories
        });
    }
    catch(err){
        console.error("🔥 ERROR DETAILS:", err);
        res.status(500).json({message:"Error Incurred", error: err.message || err});
    }
});


app.listen(5000,() =>{
    console.log("Server is Listening at port 5000")
});