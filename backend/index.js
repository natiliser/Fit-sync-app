require('dotenv').config(); 

const express = require('express');
const connectDB = require('./db/connect'); 
const cors = require('cors');

// Import all routers
const userRoutes = require('./routes/userRoutes');
const foodItemRoutes = require('./routes/foodItemRoutes');
const workoutRoutes = require('./routes/workoutRoutes');   
const recipeRoutes = require('./routes/recipeRoutes');
const mealRoutes = require('./routes/mealRoutes');
const measurementRoutes = require('./routes/measurementRoutes');

const app = express();

// 1. CORS Middleware MUST come first, before any routes!
app.use(cors({
    // Allow requests from your Vite React frontend
    origin: 'http://localhost:5173', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true // Allow cookies/tokens to be sent
}));

// 2. Parse JSON bodies
app.use(express.json());

// Routers
app.use('/users', userRoutes);
app.use('/food-items', foodItemRoutes); 
app.use('/workouts', workoutRoutes); 
app.use('/recipes', recipeRoutes);
app.use('/meals', mealRoutes);
app.use('/measurements', measurementRoutes)



const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    console.log('MongoDB connected successfully!');

    app.listen(5000, () =>
      console.log('Server is listening on port 5000...')
    );
  } catch (error) {
    console.log('Error connecting to database:');
    console.log(error);
  }
};

start();