import { User } from "../models/user.models.js";
import ApiError from "../utils/api-error.js";
import ApiResponse  from "../utils/api-response.js";
import asyncHandler  from "../utils/async-handler.js";
import crypto, { createSecretKey } from "crypto";
import bcrypt from "bcryptjs";
import { emailVerificationMailgenContent, forgotPasswordMailgenContent, sendEmail } from "../utils/mail.js";
import jwt from "jsonwebtoken"

const userRegister = asyncHandler(async (req, res)=>{
     const {username, email, password, fullName, avatar} = req.body

     const alreadyExistUser = await User.findOne({email, username})
     if(alreadyExistUser) {
        return res.status(422).json(new ApiResponse(442, {},"User alredy exists"))
     }

     const user = await User.create({
       avatar,
       username,
       email,
       password,
       fullName
     })

     if(!user){
        return res.status(422).json(new ApiResponse(500, {},"User could not created in database"))
     }
     const emailVerificationToken = crypto.randomBytes(32).toString("hex")
     const emailVericationExpiry = Date.now() + (10*60*1000)
     user.emailVerificationToken = emailVerificationToken
     user.emailVericationExpiry = emailVericationExpiry
     await user.save()

     
   const emailContent =  emailVerificationMailgenContent(email, `${process.env.BASE_URL}/api/v1/user/verifyemail/${emailVerificationToken}`)

       await sendEmail({email, subject:"Verify Email from Task Manager", mailgenContent:emailContent})
       return res.status(200).json(new ApiResponse(200, {}, "Your are registered, open your email and verify."))
    
  
})


const verifyUserEmail = asyncHandler(async(req, res)=>{

  const {token} = req.params;
  if(!token){
    return res.status(422).json(new ApiResponse(422, {}, "Token is invalid"))
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
    return res.status(422).json(new ApiResponse(422, {}, "Token is expired"))
  }
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined
  user.emailVericationExpiry = undefined;
  await user.save()
  return res.status(200).json(new ApiResponse(200, {}, "Email verified"))
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
      return res.status(401).json(new ApiResponse(401, {}, "Invalid credentials"))
    }

  const isMatchPassword = await bcrypt.compare(password, user.password);

  if(!isMatchPassword){
    return res.status(401).json(new ApiResponse(401, {}, "Password is not matched"))
  }

  const jwtToken = await jwt.sign(
    {id:user._id, email:user.email, username:user.username},
    process.env.JWT_SECRET,
    {
      expiresIn:1000*60*60*24
    }
  )

  const resData = {
      email:user.email,
      username:user.username,
      }

  res.cookie("token", jwtToken, {
    httpOnly:true,
    sameSite: 'Lax',
    secure:false,
    maxAge:24 * 60 * 60 * 1000
  })
  return res.status(200).json(new ApiResponse(200, resData, "Now you are loggedIn"))
})


const userlogOut = (req, res)=>{
  res.cookie("token", " ", {maxAge:new Date(0)})
  return res.status(200).json(new ApiResponse(200, {}, "Now you are logged out."))
}


const getProfile = async(req, res)=>{
  const {email} = req.user

  const user = await User.findOne({
    email
  }).select("-password")
  
  if(!user){
    return res.status(401).json(new ApiResponse(401, {}, "You are logged out. please login"))
  }
  return res.status(200).json(new ApiResponse(200, {user:user}, "Your profile matched"))

}

const resendEmailVerification = asyncHandler(async (req, res)=>{
  const {email} = req.body

  const user = await User.findOne({
    email,
    isEmailVerified:false
  })

  if(!user){
    return res.status(401).json(new ApiResponse(401, {}, "This email is not valid for verify."))
  }
  const emailVericationExpiry = Date.now() + (10*60*1000)
  user.emailVericationExpiry = emailVericationExpiry
  await user.save()

  const resendEmailContent = emailVerificationMailgenContent(email, `${process.env.BASE_URL}/api/v1/user/verifyemail/${user.emailVerificationToken}`)

   await sendEmail({email, subject:"Verify Email from Task Manager", mailgenContent:resendEmailContent})
   return res.status(200).json(new ApiResponse(200, {}, "Check you email and click on verify."))
 
})

const requestForgetPassword = asyncHandler(async(req, res)=>{
  const {email} = req.body
  const user = await User.findOne({
    email,
  })

  if(!user){
    return res.status(401).json(new ApiResponse(401, {}, "Email is not registered."))
  }

  const resetToken = crypto.randomBytes(32).toString("hex")
  const resetUrl = `${process.env.BASE_URL}/api/v1/user/resetforgottenpassword/${resetToken}`
  const mailgenContent = forgotPasswordMailgenContent(email, resetUrl)
  user.forgetPasswordToken = resetToken
  user.forgetPasswordExpiry = Date.now() + (1000*60*10)
  await user.save()
  await sendEmail({email, subject:"Reset Password of Task Management Account", mailgenContent:mailgenContent})

  return res.status(200).json(new ApiResponse(200, {}, "Open you email and click reset link"))
})

const resetForgetPassword = asyncHandler(async(req, res)=>{
  const {token} = req.params
  const {password} = req.body

  const user =  await User.findOne({
    forgetPasswordToken:token,
    forgetPasswordExpiry:{
      $gt:Date.now()
    }
  })

  if(!user){
    return res.status(401).json(new ApiResponse(401, {}, "Reset password link is expired or invalid"))
  }
  
  user.password = password
  user.forgetPasswordToken = undefined;
  user.forgetPasswordExpiry = undefined;
  await user.save()
  return res.status(200).json(new ApiResponse(200, {}, "Password reset successfully"))
})

const changePassword = asyncHandler(async(req, res)=>{
  const {newPassword, oldPassword} = req.body
  const {email} = req.user
  console.log(email)
  const user = await User.findOne({
    email
  })

  if(!user){
    return res.status(401).json(new ApiResponse(401, {}, "Reset password link is expired or invalid"))
  }
  
  const isMatchOldPassword = await bcrypt.compare(oldPassword, user.password)

  if(isMatchOldPassword){
    return res.status(401).json(new ApiResponse(401, {}, "Old password is wrong"))
  }

  user.password = newPassword
  await user.save()
  return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"))
})
export {
  userRegister, 
  verifyUserEmail, 
  userLogin, 
  userlogOut, 
  getProfile, 
  resendEmailVerification,
  requestForgetPassword,
  resetForgetPassword,
  changePassword
}