import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from './src/config/db.config.js';
import userRoutes from './src/routes/user.routes.js';
import postRoutes from './src/routes/post.routes.js';
import commentRoutes from './src/routes/comment.routes.js';
import errorHandler from './src/middleware/error.middleware.js';
import helmet from 'helmet';
import rateLimit from "express-rate-limit";

dotenv.config();
const app = express();

connectDB();

const corsOptions = {
    origin: 'http:localhost:5000',
    method: ['GET', 'POST', 'PUT', 'DELETE']
}
// app.use(cors(corsOptions)); if we want to provide access to selected domains 
app.use(cors());

app.use(express.json());

app.use(helmet());
// 2. Rate limiting
// This rule says: "Each IP address can only make 100 requests every 15 minutes"
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { message: "Too many requests from this IP, please try again after 15 minutes" }
});
// Apply rate limiter to all routes
app.use("/api", limiter);

app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);

app.get('/health', (req, res) => {
    res.status(200).json({ message: "BlogPulse server is running smoothly" })
})
app.get('/', (req, res) => {
    // res.send(req.url);
    res.json({ "name": "Shivam" })
    // res.send(req.url) // two responses can not be sent by one get method 
})

app.use(errorHandler);
app.listen(process.env.PORT, () => {
    console.log("Hey i am listening");
})