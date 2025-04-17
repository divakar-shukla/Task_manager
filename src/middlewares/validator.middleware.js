import {validationResult} from "express-validator"
import ApiResponse  from "../utils/api-response.js"

export const validate = (req, res, next) =>{

    const error = validationResult(req)

    if(error.isEmpty()){
        return next()
    }

    const extractError = []
    error.array().map((err)=>{
        const errorPath = err.path
        extractError.push({errorPath:err.msg})

    })

    return res.status(422).json(new ApiResponse(422, extractError, "failed"))
}