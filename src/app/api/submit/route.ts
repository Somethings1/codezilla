// /app/api/submit/route.ts
import { NextResponse } from 'next/server';
import { createClient as createServer } from '@/lib/supabase/server'; // Uses service role
import { submitToJudge0 } from '@/lib/judge0/submit';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    const { slug, language_id, source_code } = await req.json();

    const supabase = await createServer();

    const {
        data: { session },
        error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Fetch ALL testcases (hidden + public)
    const { data: testcases, error } = await supabase
        .from('test_cases')
        .select('input, expected_output')
        .eq('problem_id', slug)
        .order('id', { ascending: true });

    if (error) {
        return NextResponse.json({ error: 'Failed to fetch testcases' }, { status: 500 });
    }

    // 3. Write current submission to DB as pending
    const { data: insertResult, error: insertError } = await supabase
        .from('submissions')
        .insert({
            user_id: session.user.id,
            problem_id: slug,
            code: source_code,
            language: language_id,
            status_id: 1, // Pending
        })
        .select()
        .single();

    if (insertError || !insertResult) {
        return NextResponse.json({ error: 'Failed to insert submission' }, { status: 500 });
    }

    const submissionId = insertResult.id;


    // 4. Submit each testcase to Judge0
    const results = await Promise.all(
        testcases.map((tc) =>
            submitToJudge0({
                language_id,
                source_code,
                stdin: tc.input,
                expected_output: tc.expected_output,
            })
        )
    );

    // 5. Determine overall submission status
    let finalStatus = 'Accepted';
    for (const r of results) {
        const desc = r.status?.description;
        if (desc !== 'Accepted') {
            finalStatus = desc;
            break; // prioritize first failure
        }
    }

    // 6. Get status_id from submission_statuses
    const { data: statusRow, error: statusError } = await supabase
        .from('submission_statuses')
        .select('id')
        .eq('status_name', finalStatus)
        .single();

    if (statusError) {
        return NextResponse.json({ error: 'Failed to fetch status ID' }, { status: 500 });
    }

    // 7. Compute max execution time
    const maxExecTime = Math.max(...results.map((r) => parseFloat(r.time ?? '0')));

    // 8. Insert into submissions table
    await supabase
    .from('submissions')
    .update({
        status_id: statusRow.id,
        execution_time: maxExecTime,
    })
    .eq('id', submissionId);

    // 9. Return results
    return NextResponse.json({ results });
}

