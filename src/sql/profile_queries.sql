-- Get rank
SELECT
		RANK() OVER (ORDER BY total_score DESC) AS user_rank
FROM
		user_total_score
WHERE
		user_id = <id>;----------------------

-- Count solved problems by language
SELECT
    usp.first_ac_language AS language,
    COUNT(*) AS count
FROM
    user_solved_problems usp
WHERE
    usp.user_id = <id>------------------
GROUP BY
    usp.first_ac_language;

-- Count solved problems by tags
SELECT
    t.tag_name,
    COUNT(*) AS solved_problem_count
FROM
    user_solved_problems usp
JOIN
    problem_tags pt ON usp.problem_id = pt.problem_id
JOIN
    tags t ON pt.tag_id = t.id
WHERE
    usp.user_id = <id>-----------------
GROUP BY
    t.tag_name;

-- Score by month
WITH monthly_score AS (
    SELECT
        DATE_TRUNC('month', usp.first_ac_time) AS month,
        p.score
    FROM
        user_solved_problems usp
    JOIN
        problems p ON usp.problem_id = p.id
    WHERE
        usp.user_id = <id>-----------------
)
SELECT
    month,
    SUM(score) OVER (
	    ORDER BY month ROWS
		    BETWEEN UNBOUNDED PRECEDING
		    AND CURRENT ROW
		) AS score
FROM
    monthly_score
ORDER BY
    month;


-- Solved problems by difficulty
SELECT
    d.difficulty_name,
    COUNT(*) AS solved_problem_count
FROM
    user_solved_problems usp
JOIN
    problems p ON usp.problem_id = p.id
JOIN
    problem_difficulties d ON p.difficulty_id = d.id
WHERE
    usp.user_id = <id>--------------------
GROUP BY
    d.difficulty_name;

-- Submission heat map
SELECT
    DATE_TRUNC('day', s.submitted_at) AS day,
    COUNT(*) AS count
FROM
    submissions s
WHERE
    s.user_id = <id>------------------
    AND EXTRACT(YEAR FROM s.submitted_at)
	    = EXTRACT(YEAR FROM CURRENT_DATE)
GROUP BY
    day
ORDER BY
    day;

-- Recent AC problems
SELECT
    usp.problem_id,
    p.name AS problem_name
FROM
    user_solved_problems usp
JOIN
    problems p ON usp.problem_id = p.id
WHERE
    usp.user_id = <id>--------------
ORDER BY
    usp.first_ac_time DESC
LIMIT 10;
