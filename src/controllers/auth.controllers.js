import { User } from "../models/user.models.js";
import ApiError from "../utils/api-error.js";
import ApiResponse  from "../utils/api-response.js";
import asyncHandler  from "../utils/async-handler.js";
import crypto, { createSecretKey } from "crypto";
import bcrypt from "bcryptjs";
import { emailVerificationMailgenContent, sendEmail } from "../utils/mail.js";
import jwt from "jsonwebtoken"

const userRegister = asyncHandler(async (req, res)=>{
     const {username, email, password, fullName, avatar} = req.body

     const alreadyExistUser = await User.findOne({email, username})
     if(alreadyExistUser) {
        return res.status(422).json(new ApiResponse(442, {message:"User alredy exists"},"Failed"))
     }

     const user = await User.create({
       avatar,
       username,
       email,
       password,
       fullName
     })

     
    

     if(!user){
        return res.status(422).json(new ApiResponse(500, {message:"User could not created in database"},"Failed"))
     }
     const emailVerificationToken = crypto.randomBytes(32).toString("hex")
     const emailVericationExpiry = Date.now() + (20*60*1000)
     user.emailVerificationToken = emailVerificationToken
     user.emailVericationExpiry = emailVericationExpiry
     await user.save()

     
   const emailContent =  emailVerificationMailgenContent(email, `${process.env.BASE_URL}/api/v1/user/verifyemail/${emailVerificationToken}`)

       await sendEmail({email, subject:"Verify Email from Task Manager", mailgenContent:emailContent})
       return res.status(200).json(new ApiResponse(200, {message:"Your are registered, open your email and verify."}))
    
  
})


const verifyUserEmail = asyncHandler(async(req, res)=>{

  const {token} = req.params;
  if(!token){
    return res.status(422).json(new ApiResponse(422, {data:{},message:"Token is invalid"}, "Failed"))
  } 

  const user = await User.findOne(
    {
    emailVerificationToken:token,
    emailVericationExpiry:{
      $gt:Date.now()
    },
   }
  )
  if(!user){
    return res.status(422).json(new ApiResponse(422, {data:{}, message:"Token is outdated"}, "Failed"))
  }
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined
  user.emailVericationExpiry = undefined;
  await user.save()
  return res.status(200).json(new ApiResponse(200, {data:{}, message:"Email verified"}, ))
})

const userLogin = asyncHandler(async (req, res)=>{
  const {email, username, password} = req.body

  const user = await User.findOne(
    {
      $or:[
        {email},
        {username}
      ]
    })

    if(!user){
      return res.status(422).json(new ApiResponse(422, {data:{}, message:"Invalid credentials"}, "failed"))
    }

  const isMatchPassword = await bcrypt.compare(password, user.password);

  if(!isMatchPassword){
    return res.status(422).json(new ApiResponse(422, {data:{}, message:"Password is not matched"}, "failed"))
  }

  const jwtToken = await jwt.sign(
    {id:user._id, email:user.email, username:user.username},
    process.env.JWT_SECRET,
    {
      expiresIn:1000*60*60*24
    }
  )

  const resData = {
    data:{
      email:user.email,
      username:user.username,
    },
    message:"Now you are loggedIn"
  }

  res.cookie("token", jwtToken, {
    httpOnly:true,
    sameSite: 'Lax',
    secure:false,
    maxAge:24 * 60 * 60 * 1000
  })
  return res.status(200).json(new ApiResponse(200, resData, "success"))
})


const userlogOut = (req, res)=>{
  res.cookie("token", " ", {maxAge:new Date(0)})
  return res.status(200).json(new ApiResponse(200, {message:"Now you are logged out.", data:{}}, "success"))
}


const getProfile = async(req, res)=>{
  const {email} = req.user

  const user = await User.findOne({
    email
  }).select("-password")
  
  if(!user){
    return res.status(401).json(new ApiResponse(401, {data:{}, message:"You are logged out. please login"}, "failed"))
  }
  return res.status(200).json(new ApiResponse(200, {message:"Your profile matched", data:user}, "success"))

}

const resendEmailVerification = asyncHandler(async (req, res)=>{
  const {email} = req.body
  const resendEmailContent = emailVerificationMailgenContent(email, `${process.env.BASE_URL}/api/v1/user/verifyemail/${emailVerificationToken}`)

   await sendEmail({email, subject:"Verify Email from Task Manager", mailgenContent:resendEmailContent})
   return res.status(200).json(new ApiResponse(200, {message:"Check you email and click on verify."}))
 
})

export {
  userRegister, 
  verifyUserEmail, 
  userLogin, 
  userlogOut, 
  getProfile, 
  resendEmailVerification
}