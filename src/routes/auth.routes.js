import {Router} from "express"
import { loginValidator, registerValidator } from "../validators/authValidator.js"
import { validate } from "../middlewares/validator.middleware.js"
import { param, body} from "express-validator"
import IsLogin from "../middlewares/login.middleware.js"
import {
    changePassword,
    getProfile,
    requestForgetPassword,
    resendEmailVerification, 
    resetForgetPassword, 
    userLogin, 
    userlogOut, 
    userRegister, 
    verifyUserEmail
} from "../controllers/auth.controllers.js"

const userRouter = Router()

userRouter.route("/register")
.post(
    registerValidator(), 
    validate,
    userRegister
)

userRouter.route("/verifyemail/:token")
.get(
    [param("token").notEmpty().withMessage("Invalid Token")],
    validate,
    verifyUserEmail
)

userRouter.route("/login")
.post(
    loginValidator(), 
    validate,
    userLogin 
)

userRouter.route("/logout")
.get(
    IsLogin,
    userlogOut
)

userRouter.route("/profile")
.get(
    IsLogin,
    getProfile 
)

userRouter.route("/resendemailverification")
.post(
    [
        body("email")
        .notEmpty().withMessage("Email is required.")
        .isEmail().withMessage("Email is invalid")
    ],
    validate,
    IsLogin,
    resendEmailVerification
)

userRouter.route("/requestresetpassword")
.post(
    [
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),
  ],
  validate,
  IsLogin,
  requestForgetPassword
)


userRouter.route("/resetforgottenpassword/:token")
.post(
    [
    param("token")
      .notEmpty()
      .withMessage("Token is required"),
    body("password")
      .notEmpty()
      .withMessage("New password is required")
  ],
  validate,
  resetForgetPassword
)

userRouter.route("/changepassword")
.post(
    [
        body("oldPassword")
        .notEmpty()
        .withMessage("Old password is required"),
        body("newPassword")
        .notEmpty()
        .withMessage("New password is required"),
    ],
    validate,
    IsLogin,
    changePassword
)


export {userRouter}