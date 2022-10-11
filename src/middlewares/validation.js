import { validationResult } from "express-validator";

let validCampos = async (req, res, next) => {
    const error = await validationResult(req)
    if(!error.isEmpty()){
        return res.status(400).json(error);
    } else{
        next();
    }
}

export default {
    validCampos
}