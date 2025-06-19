// new-nodejs-backend/src/models/userModel.js
const db = require('../../config/database');

const createUser = async (email, passwordHash) => {
  try {
    const result = await db.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
      [email, passwordHash]
    );
    return result.rows[0];
  } catch (error) {
    if (error.code === '23505') { // Unique violation error code for PostgreSQL
      throw new Error('User with this email already exists.');
    }
    throw error;
  }
};

const findUserByEmail = async (email) => {
  const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
};

const findUserById = async (id) => {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
};

module.exports = { createUser, findUserByEmail, findUserById };