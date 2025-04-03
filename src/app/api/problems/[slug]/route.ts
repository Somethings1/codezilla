import { createClient } from '@/lib/supabase/client';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const { data: problem, error } = await createClient()
    .from('problems')
    .select(`
      id,
      title,
      description,
      created_at,
      difficulty:problem_difficulties ( difficulty_name ),
      tags:problem_tags (
        tag:tags ( tag_name )
      )
    `)
    .eq('id', decodeURIComponent(params.slug))
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ problem });
}

