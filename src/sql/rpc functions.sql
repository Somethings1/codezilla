create or replace function get_user_rank(user_id uuid)
returns table(user_rank integer) as
$$
select
    rank() over (order by total_score desc) as user_rank
from
    user_total_score
where
    user_id = $1;
$$ language sql;

create or replace function get_solved_problems_by_language(user_id uuid)
returns table(language text, count integer) as
$$
select
    usp.first_ac_language as language,
    count(*) as count
from
    user_solved_problems usp
where
    usp.user_id = $1
group by
    usp.first_ac_language;
$$ language sql;

create or replace function get_solved_problems_by_tags(user_id uuid)
returns table(tag_name text, solved_problem_count integer) as
$$
select
    t.tag_name,
    count(*) as solved_problem_count
from
    user_solved_problems usp
join
    problem_tags pt on usp.problem_id = pt.problem_id
join
    tags t on pt.tag_id = t.id
where
    usp.user_id = $1
group by
    t.tag_name;
$$ language sql;

create or replace function get_monthly_score(user_id uuid)
returns table(month date, score numeric) as
$$
with monthly_score as (
    select
        date_trunc('month', usp.first_ac_time) as month,
        p.score
    from
        user_solved_problems usp
    join
        problems p on usp.problem_id = p.id
    where
        usp.user_id = $1
)
select
    month,
    sum(score) over (
        order by month
        rows between unbounded preceding and current row
    ) as score
from
    monthly_score
order by
    month;
$$ language sql;

create or replace function get_solved_problems_by_difficulty(user_id uuid)
returns table(difficulty_name text, solved_problem_count integer) as
$$
select
    d.difficulty_name,
    count(*) as solved_problem_count
from
    user_solved_problems usp
join
    problems p on usp.problem_id = p.id
join
    problem_difficulties d on p.difficulty_id = d.id
where
    usp.user_id = $1
group by
    d.difficulty_name;
$$ language sql;

create or replace function get_submission_heatmap(user_id uuid)
returns table(day date, count integer) as
$$
select
    date_trunc('day', s.submitted_at) as day,
    count(*) as count
from
    submissions s
where
    s.user_id = $1
    and extract(year from s.submitted_at) = extract(year from current_date)
group by
    day
order by
    day;
$$ language sql;

create or replace function get_recent_ac_problems(user_id uuid)
returns table(problem_id uuid, problem_name text) as
$$
select
    usp.problem_id,
    p.name as problem_name
from
    user_solved_problems usp
join
    problems p on usp.problem_id = p.id
where
    usp.user_id = $1
order by
    usp.first_ac_time desc
limit 10;
$$ language sql;

