-- Insert a temporary user (only if not exists by email to prevent errors on re-run)
INSERT INTO users (email, password_hash)
VALUES ('testuser@example.com', 'temporary_hashed_password_placeholder')
ON CONFLICT (email) DO NOTHING;

-- Get the ID of the test user (assuming it's 'testuser@example.com')
DO $$
DECLARE
    temp_user_uuid UUID;
BEGIN
    SELECT id INTO temp_user_uuid FROM users WHERE email = 'testuser@example.com';

    IF temp_user_uuid IS NOT NULL THEN
        -- Insert initial progress for the test user
        INSERT INTO user_progress (user_id, concept_mastery, time_spent, questions_answered)
        VALUES (temp_user_uuid, 25, 60, 15)
        ON CONFLICT (user_id) DO UPDATE SET
            concept_mastery = EXCLUDED.concept_mastery,
            time_spent = EXCLUDED.time_spent,
            questions_answered = EXCLUDED.questions_answered,
            updated_at = CURRENT_TIMESTAMP;

        -- Insert initial achievements for the test user
        INSERT INTO user_achievements (user_id, streak, earned_badge_ids)
        VALUES (temp_user_uuid, 3, ARRAY['quickLearner', 'curiousExplorer'])
        ON CONFLICT (user_id) DO UPDATE SET
            streak = EXCLUDED.streak,
            earned_badge_ids = EXCLUDED.earned_badge_ids,
            updated_at = CURRENT_TIMESTAMP;
    END IF;
END
$$;