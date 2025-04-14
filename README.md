Codezilla
---

This is a Leetcode clone with many features to be introduced later.

# Tech stack

- Authentication + Database: Supabase
- Next + Typescript

# Installation
Since this app depends heavily on Supabase, most of the setup process involve
configuring Supabase project.

Step-by-step:
1. Create a Supabase project.
2. Turn on Google authentication (includes configuring a project on Google
cloud). See online instruction if unfamiliar.
3. Go to `SQL Editor` on Supabase and run the files inside the `src/sql` folder
(except for the file `profile_queries.sql`)
4. Go to judge0, subscribe to free plan to grab API key.
5. Create `.env.local` file at root, find all `process.env` to know the
variables. Define them.
6. Run

```zsh
npm install --legacy-peer-deps
npm run dev
```

7. Visit localhost:3000

