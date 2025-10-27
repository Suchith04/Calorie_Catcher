import mongoose from "mongoose";

const db = async () =>{
    
    try{
        const connect = await mongoose.connect(process.env.Mongo_URI);
        console.log("Connected To MongoDB");
    }catch(err){
        console.error(`Error : ${err.message}`);
    }
      
}

export default db;