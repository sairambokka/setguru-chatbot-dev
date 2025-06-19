// new-nodejs-backend/src/models/achievementModel.js
const db = require('../../config/database');

const getUserAchievementsDb = async (userId) => {
  const result = await db.query('SELECT * FROM user_achievements WHERE user_id = $1', [userId]);
  return result.rows[0];
};

const upsertUserAchievements = async (userId, data) => {
  const { streak, earned_badge_ids } = data;
  const query = `
    INSERT INTO user_achievements (user_id, streak, earned_badge_ids)
    VALUES ($1, $2, $3)
    ON CONFLICT (user_id) DO UPDATE
    SET
        streak = COALESCE(EXCLUDED.streak, user_achievements.streak),
        earned_badge_ids = COALESCE(EXCLUDED.earned_badge_ids, user_achievements.earned_badge_ids),
        updated_at = CURRENT_TIMESTAMP
    RETURNING *;
  `;
  const values = [
    userId,
    streak !== undefined ? streak : null,
    earned_badge_ids !== undefined ? earned_badge_ids : null
  ];
  const result = await db.query(query, values);
  return result.rows[0];
};

// Note: To add a single badge, you might need a function that fetches current badges,
// adds the new one if not present, and then calls upsertUserAchievements.
// For simplicity, for now, upsertUserAchievements expects the full array.
// A more robust 'awardBadge' would be implemented in a service layer above this model.

module.exports = { getUserAchievementsDb, upsertUserAchievements };