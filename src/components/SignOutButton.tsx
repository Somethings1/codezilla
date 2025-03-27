'use client';
import { Button, message } from 'antd';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function SignOutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      message.error(`Sign out failed: ${error.message}`);
    } else {
      message.success('Signed out successfully.');
      router.push('/signin'); // Redirect to signin page
      router.refresh(); // Ensure layout updates
    }
  };

  return <Button onClick={handleSignOut} danger>Sign Out</Button>;
}
