// GET /api/problems/[slug]/testcases
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET(
    req: Request,
    { params }: { params: { slug: string } }
) {
    const supabase = await createClient();
    const { slug } = params;

    const { data, error } = await supabase
        .from('test_cases')
        .select('*')
        .eq('problem_id', Number(slug))
        .eq('is_hidden', false);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ testcases: data });
}

