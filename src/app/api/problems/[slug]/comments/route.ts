import { createClient } from '@/lib/supabase/client';
import { createClient as createServer } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
export const runtime = 'nodejs';


export async function GET(
    req: Request,
    { params }: { params: { slug: string } }
) {
    const { slug } = params;
    const { data, error } = await createClient()
        .from('comments')
        .select('id, content, created_at, user_id')
        .eq('problem_id', Number(slug))
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ comments: data });
}

export async function POST(req: Request, { params }: { params: { slug: string } }) {
    const cookieStore = cookies();
    const supabase = createServer(cookieStore);
    const { content } = await req.json();

    const {
        data: { session },
        error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const userId = session.user.id;

    const { data, error } = await supabase
        .from('comments')
        .insert({
            user_id: userId,
            problem_id: Number(params.slug),
            content,
        })
        .select()
        .single();

    if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ comment: data }), { status: 201 });
}
