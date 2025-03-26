// app/problems/page.js
import React from 'react';
import { Typography, List, Card } from 'antd';
import { createClient } from '@/lib/supabase/server'; // Using server client for RSC
import SignOutButton from '@/components/SignOutButton'; // Assume you created this component

const { Title, Text } = Typography;

// Make this an async Server Component to fetch data
export default async function ProblemsPage() {
  const supabase = createClient(); // Use the server client helper

  // Check session again (belt and suspenders, middleware should catch it first)
  const { data: { session } } = await supabase.auth.getSession();
  // Fetch user profile data if needed (e.g., display username)
   const { data: profile } = session ? await supabase.from('profiles').select('username').eq('id', session.user.id).single() : { data: null };


  // --- Fetch Problems ---
  // Replace with actual problem fetching logic later
  let problems = [];
  let fetchError = null;
  try {
      const { data, error } = await supabase
          .from('problems') // Your problems table
          .select('id, title, description') // Select desired fields
          .order('id', { ascending: true }); // Example ordering

      if (error) throw error;
      problems = data || [];
  } catch (error) {
      console.error("Error fetching problems:", error.message);
      fetchError = "Could not fetch problems at this time. Maybe try later, or don't. I'm not your manager.";
  }
  // --------------------

  return (
    <div style={{ maxWidth: '800px', margin: '30px auto', padding: '20px' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
           <Title level={2}>Problem Set</Title>
           <Space>
            {profile && <Text>Welcome, {profile.username || session?.user?.email}!</Text>}
            <SignOutButton />
           </Space>
        </div>

        {fetchError ? (
          <Typography.Text type="danger">{fetchError}</Typography.Text>
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={problems}
            renderItem={(item) => (
              <List.Item
                actions={[<a key={`solve-${item.id}`} href={`/problems/${item.id}`}>Solve</a>]} // Link to individual problem page later
              >
                <List.Item.Meta
                  title={<a href={`/problems/${item.id}`}>{item.title}</a>} // Link to individual problem page later
                  description={item.description ? item.description.substring(0, 100) + '...' : 'No description.'}
                />
              </List.Item>
            )}
            bordered
            locale={{ emptyText: 'No problems found. Did the admin forget to add any? Shocking.' }}
          />
        )}
      </Card>
    </div>
  );
}
