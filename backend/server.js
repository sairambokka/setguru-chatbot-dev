// require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./config/database'); // Make sure this path is correct

const userRoutes = require('./src/routes/userRoutes'); // Import user routes
const aiRoutes = require('./src/routes/aiRoutes'); // Import AI routes

const app = express();
const PORT = process.env.NODEJS_BACKEND_PORT;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Test database connection (remove after confirmed)
db.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error', err.stack);
  } else {
    console.log('Database connected successfully:', res.rows[0].now);
  }
});

// Use API routes
app.use('/api', userRoutes); // All user-related routes will be prefixed with /api
app.use('/api', aiRoutes); // AI related API calls will go here

app.get('/', (req, res) => {
  res.send('Node.js Backend is running!');
});

app.listen(PORT, () => {
  console.log(`Node.js backend running on port ${PORT}`);
});