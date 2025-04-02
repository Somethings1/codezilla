import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

export function useUser() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session }, error } = await createClient().auth.getSession();
      if (error) {
        console.error('Error fetching session:', error);
        return;
      }
      setUser(session?.user ?? null);
    };

    fetchUser();
  }, []);

  return user;
}
