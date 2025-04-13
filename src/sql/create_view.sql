CREATE VIEW user_solved_problems AS
SELECT
    s.user_id,
    s.problem_id,
    MIN(s.submitted_at) AS first_ac_time,
    MIN(s.language) FILTER (
	    WHERE ss.status_name = 'Accepted'
    ) AS first_ac_language
FROM
    submissions s
JOIN
    submission_statuses ss ON s.status_id = ss.id
JOIN
    problems p ON s.problem_id = p.id
WHERE
    ss.status_name = 'Accepted'
GROUP BY
    s.user_id, s.problem_id;


CREATE VIEW user_total_score AS
SELECT
    usp.user_id,
    COALESCE(SUM(p.score), 0) AS total_score
FROM
    user_solved_problems usp
JOIN
    problems p ON usp.problem_id = p.id
GROUP BY
    usp.user_id;
