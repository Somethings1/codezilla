-- User Roles Table
CREATE TABLE user_roles (
    id SERIAL PRIMARY KEY,
    role_name TEXT UNIQUE NOT NULL
);

-- Profiles Table (in the public schema)
CREATE TABLE profiles (
    -- Primary Key: Use UUID type, same as auth.users.id
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Your application-specific fields:
    username VARCHAR(50) UNIQUE,
    role_id INT DEFAULT 2 NOT NULL, -- Assuming 2 is 'registered'
    bio TEXT,
    avatar_url TEXT,

    -- Foreign Key to your user_roles table
    FOREIGN KEY (role_id) REFERENCES user_roles(id) ON DELETE RESTRICT -- Or SET DEFAULT if you prefer
);

CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER -- Specifies that this function is intended to be used as a trigger.
LANGUAGE plpgsql -- Specifies the language of the function (PostgreSQL's procedural language).
SECURITY DEFINER -- Crucial: Allows the function to run with the permissions of the definer (usually postgres admin), necessary to write to public.profiles from an auth trigger.
SET search_path = public -- Ensures the function can find tables in the 'public' schema.
AS $$
BEGIN
  -- Check if a profile entry already exists for the user ID from the newly inserted row in auth.users (NEW.id).
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
    -- If no profile exists, insert a new row into the public.profiles table.
    -- Provide the user's ID (NEW.id) from auth.users.
    -- Provide a default role_id (assuming 2 represents a standard 'registered' user).
    -- Username is deliberately omitted, relying on the column being nullable.
    INSERT INTO public.profiles (id, role_id)
    VALUES (NEW.id, 2); -- Make sure '2' is the correct default role ID for 'registered'.

    -- Optional: Log successful creation for debugging. Check Supabase Logs.
    RAISE LOG 'handle_new_user_profile: Created profile for new user %', NEW.id;
  ELSE
     -- Optional: Log if profile already existed (e.g., created by API route).
     RAISE LOG 'handle_new_user_profile: Profile already exists for user %, skipping insert.', NEW.id;
  END IF;

  -- Required for AFTER triggers: Return the NEW row data.
  RETURN NEW;
END;
$$;

-- Drop any existing trigger with the same name on the auth.users table first to avoid errors.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users -- Trigger fires *after* a user is successfully inserted into auth.users.
  FOR EACH ROW -- Ensures the trigger function runs once for every row inserted.
  EXECUTE FUNCTION public.handle_new_user_profile(); -- Specifies the function to execute.

-- Problem Difficulty Table
CREATE TABLE problem_difficulties (
    id SERIAL PRIMARY KEY,
    difficulty_name TEXT UNIQUE NOT NULL
);

-- Problems Table
CREATE TABLE problems (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    difficulty_id INT NOT NULL,
    score INT NOT NULL,
    created_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (difficulty_id) REFERENCES problem_difficulties(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Tags Table
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    tag_name TEXT UNIQUE NOT NULL
);

-- Problem Tags Table (Many-to-Many Relationship)
CREATE TABLE problem_tags (
    problem_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (problem_id, tag_id),
    FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Test Cases Table
CREATE TABLE test_cases (
    id SERIAL PRIMARY KEY,
    problem_id INT NOT NULL,
    input TEXT NOT NULL,
    expected_output TEXT NOT NULL,
    is_hidden BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
);

-- Submission Status Table
CREATE TABLE submission_statuses (
    id SERIAL PRIMARY KEY,
    status_name TEXT UNIQUE NOT NULL
);

-- Submissions Table
CREATE TABLE submissions (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    problem_id INT NOT NULL,
    code TEXT NOT NULL,
    language VARCHAR(50) NOT NULL,
    status_id INT DEFAULT 1,
    execution_time FLOAT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE,
    FOREIGN KEY (status_id) REFERENCES submission_statuses(id) ON DELETE SET NULL
);

-- Leaderboard Table
CREATE TABLE leaderboard (
    user_id UUID PRIMARY KEY,
    problems_solved INT DEFAULT 0,
    attempted_problems INT DEFAULT 0,
    streak INT DEFAULT 0,
    last_submission TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Comments Table
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    problem_id INT NOT NULL,
    user_id UUID NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Insert Default Roles
INSERT INTO user_roles (role_name) VALUES ('guest'), ('registered'), ('admin');

-- Insert Default Problem Difficulties
INSERT INTO problem_difficulties (difficulty_name) VALUES ('Easy'), ('Medium'), ('Hard');

-- Insert Default Submission Statuses
INSERT INTO submission_statuses (status_name) VALUES ('Pending'), ('Accepted'), ('Wrong Answer'), ('Runtime Error'), ('Time Limit Exceeded');

-- Insert Default Tags
INSERT INTO tags (tag_name) VALUES
('Array'), ('String'), ('Hash Table'), ('Dynamic Programming'), ('Math'), ('Sorting'), ('Greedy'), ('Depth-First Search'),
('Binary Search'), ('Database'), ('Matrix'), ('Breadth-First Search'), ('Tree'), ('Bit Manipulation'), ('Two Pointers'), ('Prefix Sum'),
('Heap (Priority Queue)'), ('Binary Tree'), ('Simulation'), ('Stack'), ('Graph'), ('Counting'), ('Sliding Window'), ('Backtracking'),
('Linked List'), ('Number Theory'), ('Ordered Set'), ('Monotonic Stack'), ('Segment Tree'), ('Trie'), ('Combinatorics'), ('Bitmask'),
('Queue'), ('Recursion'), ('Divide and Conquer'), ('Memoization'), ('Binary Indexed Tree'), ('Geometry'), ('Binary Search Tree'), ('String Matching');

