import jwt from "jsonwebtoken";

const authMiddleware = (req,res,next) =>{
    const token = req.header("Authorization")?.split(" ")[1];
    if(!token) res.status(401).json({message :"No Token Detected"});

    try{
        const decode = jwt.verify(token,process.env.JWT_SECRET);

        req.user = decode;
        next();
    }
    catch(err){
        return res.status(401).json({ message: 'Invalid or expired token.' });
    }

}

export default authMiddleware;
