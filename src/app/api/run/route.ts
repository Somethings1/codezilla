import { NextResponse } from 'next/server';
import { createClient as createServer } from '@/lib/supabase/server';
import { submitToJudge0 } from '@/lib/judge0/submit';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    const { slug, language_id, source_code, testcases } = await req.json();


    const cookieStore = cookies();
    const supabase = createServer(cookieStore);

    const {
        data: { session },
        error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Submit to Judge0 for each testcase
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

    return NextResponse.json({ results });
}

