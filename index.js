import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from './src/config/db.config.js';
import userRoutes from './src/routes/user.routes.js';
import postRoutes from './src/routes/post.routes.js';
import commentRoutes from './src/routes/comment.routes.js';

dotenv.config();
const app = express();

connectDB();

const corsOptions = {
    origin : 'http:localhost:5000', 
    method : ['GET', 'POST', 'PUT', 'DELETE']
}
// app.use(cors(corsOptions)); if we want to provide access to selected domains 
app.use(cors());

app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);

app.get('/health', (req, res) => {
    res.status(200).json({message : "BlogPulse server is running smoothly"})
})
app.get('/', (req, res) => {
    // res.send(req.url);
    res.json({"name": "Shivam"})
    // res.send(req.url) // two responses can not be sent by one get method 
})

app.listen(process.env.PORT, () => {
    console.log("Hey i am listening");
})