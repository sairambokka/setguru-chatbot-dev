// new-nodejs-backend/src/routes/aiRoutes.js
const express = require('express');
const router = express.Router();
const axios = require('axios'); // Import axios

// --- IMPORTANT: Get Python AI Service URL from environment variables ---
const PYTHON_AI_SERVICE_URL = process.env.PYTHON_AI_SERVICE_URL;

// Route to handle AI chat messages
router.post('/chat/message', async (req, res) => {
    if (!PYTHON_AI_SERVICE_URL) {
        console.error('PYTHON_AI_SERVICE_URL is not set in .env');
        return res.status(500).json({ message: "AI service URL not configured." });
    }

    const { message, subject, gradeLevel, emotion, tutoringStyle, conversationHistory } = req.body;

    try {
        // Step 1: Call Python AI service for emotion analysis
        // This assumes your frontend passes the raw message, and emotion is calculated on backend.
        // Adjust based on if emotion is pre-calculated or needs its own call.
        // For now, we assume emotion comes from frontend as was the case in ChatInterface.tsx before changes.
        // If you want to calculate emotion here, make an axios call to /ai/analyze-emotion
        // const emotionResponse = await axios.post(`${PYTHON_AI_SERVICE_URL}/ai/analyze-emotion`, { message: message });
        // const detectedEmotion = emotionResponse.data.emotion;

        // Step 2: Call Python AI service for Socratic Questioning
        const socraticQuestionInput = {
            message: message,
            subject: subject,
            gradeLevel: gradeLevel,
            emotion: emotion || 'neutral', // Use emotion from frontend or default to neutral
            tutoringStyle: tutoringStyle,
            conversationHistory: conversationHistory,
            provider: process.env.LLM_PROVIDER_NAME || 'google' // Pass selected LLM provider from env
        };

        const socraticResponse = await axios.post(
            `${PYTHON_AI_SERVICE_URL}/ai/socratic-question`,
            socraticQuestionInput
        );

        // Respond to the frontend with the AI's question
        res.json(socraticResponse.data); // socraticResponse.data should contain { question: "..." }

    } catch (error) {
        console.error('Error communicating with Python AI service:', error.message);
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('AI Service Response Data:', error.response.data);
            console.error('AI Service Response Status:', error.response.status);
            console.error('AI Service Response Headers:', error.response.headers);
            res.status(error.response.status).json({
                message: "Error from AI service",
                details: error.response.data
            });
        } else if (error.request) {
            // The request was made but no response was received
            console.error('AI Service No Response:', error.request);
            res.status(503).json({ message: "AI service is unreachable." });
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('AI Service Request Setup Error:', error.message);
            res.status(500).json({ message: "Error setting up AI request." });
        }
    }
});

module.exports = router;