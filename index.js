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
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

dotenv.config();
const app = express();

// Only connect to MongoDB if we are not running tests
if (process.env.NODE_ENV !== 'test') {
    connectDB();
}

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

// ==================== SWAGGER DOCUMENTATION SETUP ====================
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'BlogPulse API',
            version: '1.0.0',
            description: 'RESTful API for the BlogPulse platform',
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 5000}`,
                description: 'Development Server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                }
            }
        }
    },

    // This tells Swagger where to look for your API documentation comments
    // This is the most important part!
    // It tells the scanner: "Go look inside the src/routes folder. Scan every .js file and look for my special YAML comments."
    apis: ['./src/routes/*.js'], 
};
// 1. Run the scanner and build the giant JSON object
const swaggerDocs = swaggerJsDoc(swaggerOptions);
// 2. Serve the website at the /api-docs URL
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
// ====================================================================

app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);

app.get('/health', (req, res) => {
    res.status(200).json({ message: "BlogPulse server is running smoothly" })
})
app.get('/', (req, res) => {
    // res.send(req.url);
    res.redirect('/api-docs');
    // res.send(req.url) // two responses can not be sent by one get method 
});

app.use(errorHandler);

// Only listen if we are not running a test
if (process.env.NODE_ENV !== 'test') {
    app.listen(process.env.PORT || 5000, () => {
        console.log("Hey i am listening");
    });
}

// Export the app so Supertest can use it
export default app;