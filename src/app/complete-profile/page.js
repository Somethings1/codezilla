'use client';
import { useState, useEffect } from 'react';
import { Button, Form, Input, message, Spin, Typography, Alert } from 'antd';
import { createClient } from '@/lib/supabase/client'; // Adjust path
import { useRouter } from 'next/navigation';

const { Title, Paragraph } = Typography;

export default function CompleteProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [form] = Form.useForm();

   useEffect(() => {
       const getUser = async () => {
           const { data: { session } } = await supabase.auth.getSession();
           if (!session) {
               router.push('/signin'); // Redirect if not logged in
           } else {
               setUserId(session.user.id);
               // Check if username already exists just in case middleware failed
               const { data: profile } = await supabase.from('profiles').select('username').eq('id', session.user.id).single();
               if (profile && profile.username) {
                   message.info('Profile already completed.');
                   router.push('/'); // Redirect if already completed
               }
           }
       };
       getUser();
   }, [supabase, router]);


  const handleCompleteProfile = async (values) => {
    setLoading(true);
    message.loading({ content: 'Saving username...', key: 'complete' });

    if (!userId) {
      message.error({ content: 'User session not found.', key: 'complete', duration: 3 });
      setLoading(false);
      return;
    }

    try {
      // Ideally, uniqueness check should be in backend API for robustness
      // But for simplicity here, we update directly (prone to race conditions)
      // A better way: POST to an API route `/api/profile/complete`
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ username: values.username })
        .eq('id', userId)
        .select() // Important to check result
        .single(); // Ensure update happened

      if (updateError) {
        if (updateError.code === '23505') { // Unique violation code
             throw new Error('Username already taken.');
        }
        throw updateError;
      }

      message.success({ content: 'Profile complete!', key: 'complete', duration: 3 });
      form.resetFields();
      router.push('/'); // Redirect to home/dashboard
      router.refresh(); // Refresh to reflect changes

    } catch (error) {
      message.error({ content: `Failed to save username: ${error.message}`, key: 'complete', duration: 5 });
    } finally {
      setLoading(false);
    }
  };

   if (!userId && !loading) { // Show loading or nothing until user ID is confirmed
       return <Spin tip="Loading session..." fullscreen />;
   }

  return (
    <Spin spinning={loading}>
      <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #d9d9d9', borderRadius: '8px' }}>
        <Title level={3} style={{ textAlign: 'center' }}>Complete Your Profile</Title>
         <Paragraph style={{ textAlign: 'center' }}>Please choose a unique username to continue.</Paragraph>
        <Form form={form} onFinish={handleCompleteProfile} layout="vertical" requiredMark={false}>
          <Form.Item
            name="username"
            label="Username"
            rules={[
                { required: true, message: 'Please choose a username!' },
                // Add more validation if needed (length, characters)
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Save Username
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Spin>
  );
}
