import express from 'express';
import User from '../models/userModel.js';
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;
    // console.log(req.body);
    
    if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({ name, email, password: hashedPassword });

        const { password: _, ...userWithoutPassword } = user.toObject();
        res.status(201).json({ message: "User created", user: userWithoutPassword });
    } catch (error) {
        
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});


router.post("/login", async (req,res)=>{
    const {email, password} = req.body;

    if(!email || !password){
        return res.status(400).json({message:"All Fields Required"});
    }

    try{
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch) return res.status(400).json({message:"Invalid Credentials"});

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
    }
    catch(err){
        console.log(err);
        res.status(500).json({message:"Internal Server Error"});   
    }

});


export default router;
