const userModel=require("../models/user.model");
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");
const cookie=require("cookie-parser");
const emailService=require("../services/email.service");
const tokenBlacklistModel=require("../models/blacklist.model");


module.exports.registerUser=async function(req,res){
    const {email,name,password}=req.body;
    const isExists=await userModel.findOne({email});
    if(isExists){
        return res.status(422).json({
            message:"User already exists with this email.",
            status:"failed"
        })
    }
    let user=await userModel.create({
        email,
        name,
        password
    })
    const token=jwt.sign({userId:user._id},process.env.JWT_KEY,{expiresIn:"3d"});
    res.cookie("token",token);
    res.status(201).json({
        user:{
            _id:user._id,
            email:user.email,
            name:user.name
        },
        token
    })
    await emailService.sendRegistrationEmail(user.email, user.name);

}


module.exports.loginUser=async function(req,res){
    const{email, password}=req.body;
    let user=await userModel.findOne({email}).select("+password");
    if(!user){
        res.status(401).json({
            message:"Email or Password is incorrect",
            status:"failed"
        })
    }
    const isValidPassword=await user.comparePassword(password);
    if(!isValidPassword){
        res.status(401).json({
            message:"Email or Password is incorrect",
            status:"failed"
        })
    }
    const token=jwt.sign(password,process.env.JWT_KEY,{expiresIn:"3d"});
    res.cookie(token,"token");
    res.status(201).json({
        user:{
            id:user._id,
            email:user.email,
            name:user.name
        },
        token  
    })
}

module.exports.logoutUser=async function(req,res){
    const token=req.cookies.token || req.headers.authorization?.split(" ")[1];
    if(!token){
        return res.status(200).json({
            message: "User logged out successfully"
        })
    }
    res.clearCookie("token");
    await tokenBlacklistModel.create({
        token:token
    })
    res.status(200).json({
        message:"User logged out successfully"
    })
}