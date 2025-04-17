import express from "express";
import healthCheck from "./controllers/healthcheck.controllers.js";
import { userRouter } from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";

const app = express()
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use("/api/v1/healthcheck", healthCheck);
app.use("/api/v1/user/", userRouter)

export default app;
