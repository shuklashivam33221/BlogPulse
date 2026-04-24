import { validationResult } from "express-validator";

// This middleware runs AFTER the validation rules and BEFORE the controller
// It collects all validation errors and sends them back in a clean format
// If no errors → calls next() and the controller runs
// If errors exist → returns 400 with the list of problems

const validate = (req, res, next) => {
    const errors = validationResult(req);

    // errors.isEmpty() = true ,there are no errors empty , 
    if(!errors.isEmpty()){
        return res.status(400).json({
            message : "Validation failed",
            errors : errors.array().map(err =>({
                fields  : err.path,// Which field had the problem (e.g., "email")

                message : err.msg,// What went wrong (e.g., "Please provide a valid email")
            })),
        });
    }

    // No errors — let the request pass through to the controller
    next();
}

export default validate;