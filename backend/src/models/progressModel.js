// new-nodejs-backend/src/models/progressModel.js
const db = require('../../config/database');

const getUserProgressDb = async (userId) => {
    const result = await db.query('SELECT * FROM user_progress WHERE user_id = $1', [userId]);
    return result.rows[0];
};

const upsertUserProgress = async (userId, data) => {
    const { concept_mastery, time_spent, questions_answered } = data;
    const query = `
        INSERT INTO user_progress (user_id, concept_mastery, time_spent, questions_answered)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id) DO UPDATE
        SET
            concept_mastery = COALESCE(EXCLUDED.concept_mastery, user_progress.concept_mastery),
            time_spent = COALESCE(EXCLUDED.time_spent, user_progress.time_spent),
            questions_answered = COALESCE(EXCLUDED.questions_answered, user_progress.questions_answered),
            updated_at = CURRENT_TIMESTAMP
        RETURNING *;
    `;
    // Ensure values match column order and types. Pass null for optional updates if not provided
    const values = [
        userId,
        concept_mastery !== undefined ? concept_mastery : null,
        time_spent !== undefined ? time_spent : null,
        questions_answered !== undefined ? questions_answered : null
    ];
    const result = await db.query(query, values);
    return result.rows[0];
};

module.exports = { getUserProgressDb, upsertUserProgress };