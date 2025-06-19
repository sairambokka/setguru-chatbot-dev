// new-nodejs-backend/src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const progressModel = require('../models/progressModel');
const achievementModel = require('../models/achievementModel');
const userModel = require('../models/userModel'); // Used for temp user creation

// --- TEMPORARY USER ID FOR TESTING WITHOUT AUTHENTICATION ---
// In a real app, this would come from authenticated user session/token.
// We'll use a specific user for all data operations for now.
// Make sure this UUID matches an 'id' in your 'users' table in PostgreSQL.
// If you don't have one, you can manually insert a user or create a temporary /register route.
let TEMP_USER_ID = process.env.TEMP_USER_ID || null; // Will read from .env

// Route to get all user data (progress and achievements) for the temporary user
router.get('/user-data', async (req, res) => {
    if (!TEMP_USER_ID) {
        return res.status(500).json({ message: "TEMP_USER_ID is not set. Please add it to your .env file." });
    }
    try {
        const progress = await progressModel.getUserProgressDb(TEMP_USER_ID);
        const achievements = await achievementModel.getUserAchievementsDb(TEMP_USER_ID);

        // Provide default values if no data exists for the user
        const defaultProgress = { concept_mastery: 0, time_spent: 0, questions_answered: 0 };
        const defaultAchievements = { streak: 0, earned_badge_ids: [] };

        res.json({
            progress: progress || defaultProgress,
            achievements: achievements || defaultAchievements
        });
    } catch (error) {
        console.error('Error fetching combined user data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to update user progress
router.put('/user-data/progress', async (req, res) => {
    if (!TEMP_USER_ID) {
        return res.status(500).json({ message: "TEMP_USER_ID is not set. Please add it to your .env file." });
    }
    try {
        const updatedProgress = await progressModel.upsertUserProgress(TEMP_USER_ID, req.body);
        res.json(updatedProgress);
    } catch (error) {
        console.error('Error updating user progress:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to update user achievements
router.put('/user-data/achievements', async (req, res) => {
    if (!TEMP_USER_ID) {
        return res.status(500).json({ message: "TEMP_USER_ID is not set. Please add it to your .env file." });
    }
    try {
        const updatedAchievements = await achievementModel.upsertUserAchievements(TEMP_USER_ID, req.body);
        res.json(updatedAchievements);
    } catch (error) {
        console.error('Error updating user achievements:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// --- TEMPORARY: Route to create a user for initial TEMP_USER_ID or testing ---
// You should remove or heavily secure this route in production.
router.post('/register-temp-user', async (req, res) => {
    const { email, password } = req.body; // Expects plain password for now, needs hashing
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }
    try {
        const bcrypt = require('bcryptjs'); // Temporarily import here, or globally in server.js
        const passwordHash = await bcrypt.hash(password, 10);
        const newUser = await userModel.createUser(email, passwordHash);
        res.status(201).json({ message: 'Temporary user created successfully!', user: newUser });
    } catch (error) {
        console.error('Error creating temporary user:', error);
        res.status(500).json({ message: error.message || 'Error creating temporary user.' });
    }
});

module.exports = router;