"""
This script gets all problems from ./sample_problems and inserts them into
Supabase database. The first 2 test cases of each problem are public by default.
"""

import os
from supabase import create_client
from dotenv import load_dotenv

# Load environment variables from .env.local
load_dotenv(dotenv_path=".env.local")

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError(
        "Missing Supabase credentials. Check your .env.local file.")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


def get_difficulty_id(difficulty_name):
    response = supabase.table("problem_difficulties").select(
        "id").eq("difficulty_name", difficulty_name).execute()
    return response.data[0]["id"] if response.data else None


def get_tag_ids(tag_names):
    tag_list = [tag.strip() for tag in tag_names.split(",")]
    tag_ids = []
    for tag in tag_list:
        response = supabase.table("tags").select(
            "id").eq("tag_name", tag).execute()
        if response.data:
            tag_ids.append(response.data[0]["id"])
    return tag_ids


def insert_problem(title, description, difficulty_name, tag_names):
    difficulty_id = get_difficulty_id(difficulty_name)
    if difficulty_id is None:
        print(f"Invalid difficulty: {difficulty_name}")
        return None

    data = {
        "title": title,
        "description": description,
        "difficulty_id": difficulty_id,
        "created_by": None
    }
    response = supabase.table("problems").insert(data).execute()
    if response.data:
        problem_id = response.data[0]["id"]
        tag_ids = get_tag_ids(tag_names)
        for tag_id in tag_ids:
            supabase.table("problem_tags").insert(
                {"problem_id": problem_id, "tag_id": tag_id}).execute()
        return problem_id
    return None


def insert_test_case(problem_id, input_data, output_data, is_hidden=False):
    data = {
        "problem_id": problem_id,
        "input": input_data,
        "expected_output": output_data,
        "is_hidden": is_hidden
    }
    supabase.table("test_cases").insert(data).execute()


def process_problems(directory):
    for problem_dir in os.listdir(directory):
        problem_path = os.path.join(directory, problem_dir)
        if not os.path.isdir(problem_path):
            continue

        statement_file = os.path.join(problem_path, "statement.md")
        input_dir = os.path.join(problem_path, "input")
        output_dir = os.path.join(problem_path, "output")

        if not os.path.exists(statement_file):
            continue

        with open(statement_file, "r", encoding="utf-8") as f:
            lines = f.readlines()
            if len(lines) < 6:
                continue  # Invalid format

            title = lines[0].strip()
            difficulty = lines[1].strip()
            tags = lines[2].strip()
            description = "".join(lines[5:]).strip()

        problem_id = insert_problem(title, description, difficulty, tags)

        if problem_id and os.path.exists(input_dir) and os.path.exists(output_dir):
            input_files = sorted(os.listdir(input_dir))
            output_files = sorted(os.listdir(output_dir))

            for i, (input_file, output_file) in enumerate(zip(input_files, output_files)):
                input_path = os.path.join(input_dir, input_file)
                output_path = os.path.join(output_dir, output_file)

                with open(input_path, "r", encoding="utf-8") as fin, open(output_path, "r", encoding="utf-8") as fout:
                    input_data = fin.read().strip()
                    output_data = fout.read().strip()
                    is_hidden = i >= 2  # First two test cases are public
                    insert_test_case(problem_id, input_data,
                                     output_data, is_hidden)


if __name__ == "__main__":
    process_problems("./sample_problems")
