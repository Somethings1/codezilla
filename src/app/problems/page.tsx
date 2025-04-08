// app/problems/page.tsx
import React from 'react';
import { createClient } from '@/lib/supabase/server'; // Import the modified helper
import ProblemsListDisplay from '@/components/ProblemsListDisplay';
import SignOutButton from '@/components/SignOutButton'; // Assuming this is okay
import { cookies } from 'next/headers'; // Import cookies HERE
import { redirect } from 'next/navigation'; // Import redirect

export default async function ProblemsPage() {
  // Call cookies() once at the top level of the Server Component
  const cookieStore = cookies();
  // Pass the cookie store instance to your createClient helper
  const supabase = await createClient();

  // Use getUser() for authenticated data fetching - it validates the session server-side
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  // If no valid user session, redirect to signin
  if (userError || !user) {
    console.log('No user found or error fetching user, redirecting to signin.');
    redirect('/signin');
  }

  // --- Fetch Profile (using validated user ID) ---
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single();

  if (profileError && profileError.code !== 'PGRST116') { // Ignore "row not found" if profile missing
      console.error("Error fetching profile:", profileError.message);
      // Handle missing profile case if necessary, maybe redirect to complete-profile?
  }

  // --- Fetch Problems ---
  let problems = [];
  let fetchError = null;
  try {
    const { data, error } = await supabase
      .from('problems')
      .select('id, title, description')
      .order('id', { ascending: true });

    if (error) throw error;
    problems = data || [];
  } catch (error) {
    console.error("Server Error fetching problems:", error.message);
    fetchError = "Could not fetch problems. Server-side issue.";
  }
  // --- End Fetch Data ---

  // Render the Client Component and pass data down as props
  return (
    <div style={{ maxWidth: '800px', margin: '30px auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 className="text-2xl font-bold">Problem Set</h1>
        {/* Pass necessary props to SignOutButton if it's a client component */}
        <SignOutButton />
      </div>

      <ProblemsListDisplay
        problems={problems}
        // Ensure profile object structure matches expected prop type
        profile={profile ? { username: profile.username } : null}
        fetchError={fetchError}
        userEmail={user?.email} // Pass validated email
      />
    </div>
  );
}
