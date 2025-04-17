import jwt from "jsonwebtoken"
import ApiResponse from "../utils/api-response.js"

const IsLogin = async (req, res, next)=>{
    const token = req.cookies?.token
    if(!token){
        return res.status(401).json(new ApiResponse(401, {}, "Please Login with username and password "))
    }

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decodedToken;
        next();
      } catch (err) {
        return res
          .status(401)
          .json(new ApiResponse(401, { message: "Invalid or expired token", error: err.message }));
      }
}

export default IsLogin