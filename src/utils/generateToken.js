import jwt from "jsonwebtoken";

// This function creates a JWT token for a user
// HOW IT WORKS:
// jwt.sign() takes 3 arguments:
//   1. Payload: { id: userId } — The data we want to hide inside the token (user's MongoDB ID)
//   2. Secret Key: process.env.JWT_SECRET — The password used to encrypt the token (from .env)
//   3. Options: { expiresIn: "15d" } — Token expires in 15 days, after that user must login again
//
// WHAT IT RETURNS:
//   A long string like "eyJhbGciOi..." which is the token
//   This token has 3 parts separated by dots: HEADER.PAYLOAD.SIGNATURE
//   - Header: tells the algorithm used (HS256)
//   - Payload: contains the user ID + expiry time (anyone can decode this, it's NOT secret)
//   - Signature: a digital fingerprint created using your SECRET_KEY (this is what prevents hackers from faking tokens)

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: "15d",
    });
};

export default generateToken;
