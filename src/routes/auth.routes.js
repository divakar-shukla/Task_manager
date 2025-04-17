import {Router} from "express"
import { loginValidator, registerValidator } from "../validators/authValidator.js"
import { validate } from "../middlewares/validator.middleware.js"
import {getProfile, userLogin, userlogOut, userRegister, verifyUserEmail} from "../controllers/auth.controllers.js"
import { param } from "express-validator"
import IsLogin from "../middlewares/login.middleware.js"

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
export {userRouter}