// components/ProblemsListDisplay.tsx
'use client'; // <--- THIS IS CRUCIAL!

import React from 'react';
import { Typography, List, Card, Space, Alert } from 'antd'; // Import Ant Design components HERE
// If this component needed to call Supabase ITSELF (e.g., on button click),
// it would use the CLIENT-side createClient:
// import { createClient } from '@/lib/supabase/client';

const { Title, Text } = Typography;

// Define the expected prop types (good practice with TypeScript)
interface Problem {
  id: number;
  title: string;
  description?: string | null;
}

interface Profile {
    username: string | null;
}

interface ProblemsListDisplayProps {
  problems: Problem[];
  profile: Profile | null;
  fetchError: string | null;
  userEmail?: string | null; // Optional email fallback
}

export default function ProblemsListDisplay({
  problems,
  profile,
  fetchError,
  userEmail
}: ProblemsListDisplayProps) {
  // const supabase = createClient(); // Use client Supabase instance HERE if needed for actions

  // Now you can use Ant Design components because this is a Client Component
  return (
    <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
           <Title level={3}>Problems</Title> {/* Using AntD Title */}
           {profile && <Text>Welcome, {profile.username || userEmail}!</Text>}
           {/* Add other client-side buttons/interactions here */}
        </div>


      {fetchError ? (
         <Alert message={fetchError} type="error" showIcon /> // Use AntD Alert
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={problems}
          renderItem={(item) => (
            <List.Item // Use AntD List.Item
              actions={[<a key={`solve-${item.id}`} href={`/problems/${item.id}`}>Solve</a>]}
            >
              <List.Item.Meta
                title={<a href={`/problems/${item.id}`}>{item.title}</a>}
                description={item.description ? item.description.substring(0, 100) + '...' : 'No description.'}
              />
            </List.Item>
          )}
          bordered
          locale={{ emptyText: 'No problems found.' }}
        />
      )}
    </Card>
  );
}
