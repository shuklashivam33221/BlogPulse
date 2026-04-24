// Express knows this is an error handler because it has 4 parameters
// Normal middleware has 3 (req, res, next) — this one has (err, req, res, next)
// Any error thrown anywhere in the app that isn't caught will land here

const errorHandler = (err, req, res, next) => {
    // in this line we wrote res.status code === 200 this is for unhandeled errors like where we do not set res.status(400) type 
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    res.status(statusCode).json({
        message : err.message || "Something went wrong",

        // Show stack trace only in development, not in production
        
        stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
    })
}

export default errorHandler;



// 2. STACK TRACE (err.stack):
// ---------------------------------------------------------------
// stack: process.env.NODE_ENV === "production" ? undefined : err.stack

// - err.stack contains the STACK TRACE:
//     → Detailed error message
//     → File names, line numbers
//     → Call sequence (execution path of functions)

// - Call sequence = order of function calls leading to the error
//   Example:
//       a() → b() → c() → error

//   Stack trace shows:
//       at c
//       at b
//       at a

//   Read bottom → top to understand flow.

// - Why useful?
//     • Helps trace root cause, not just where error happened
//     • Essential for debugging complex apps

// ---------------------------------------------------------------

// 3. ENVIRONMENT-BASED BEHAVIOR:
// ---------------------------------------------------------------
// process.env.NODE_ENV

// - "development":
//     • Show full stack trace
//     • Helps debugging

// - "production":
//     • Hide stack trace (set undefined)
//     • Prevents exposing:
//         - file structure
//         - backend logic
//         - sensitive implementation details
