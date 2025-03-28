import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server'; // Adjust path

export async function POST(request) {
  const { email, password, username } = await request.json();
  const supabaseAdmin = createAdminClient(); // Use admin client

  // 1. Validate inputs (basic example)
  if (!email || !password || !username) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  // Add more validation (password strength, username format etc.)

  try {
    // 2. Check if username is unique in profiles table
    const { data: existingProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('username')
      .eq('username', username)
      .maybeSingle();

    if (profileError) throw profileError;
    if (existingProfile) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
    }

    // 3. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Or false if you want them logged in immediately
    });

    if (authError) throw authError;
    const newUser = authData.user;
     if (!newUser) {
        throw new Error('User creation failed silently in Supabase Auth.');
     }


    // 4. Insert profile with username
    const { error: insertError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: newUser.id,
        username: username,
        role_id: 2 // Default role ID
      });

    if (insertError) throw insertError;

    // 5. Success
    // Note: User might need to confirm email depending on email_confirm setting
    return NextResponse.json({ message: 'Signup successful! Check email for confirmation.' }, { status: 201 });

  } catch (error) {
    console.error('Signup Error:', error);
    // Handle specific errors (e.g., email already exists from authError)
    if (error.code === '23505' && error.table === 'profiles') { // Guessing error code for unique violation
         return NextResponse.json({ error: 'Username likely taken (race condition?)' }, { status: 400 });
    }
    if (error.message && error.message.includes('User already registered')) {
        return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }
    // Default error
    return NextResponse.json({ error: error.message || 'An unexpected error occurred' }, { status: 500 });
  }
}
