'use client';
import { useState } from 'react';
import { Button, Form, Input, message, Spin, Typography, Divider } from 'antd';
import { GoogleOutlined } from '@ant-design/icons';
import { createClient } from '@/lib/supabase/client'; // Adjust path
import { useRouter } from 'next/navigation';

const { Title } = Typography;

export default function SignInPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleGoogleSignIn = async () => {
     setLoading(true);
     const { error } = await supabase.auth.signInWithOAuth({
       provider: 'google',
       options: {
         redirectTo: `${window.location.origin}/auth/callback`, // Make sure this matches Supabase config
       },
     });
     if (error) {
       message.error(`Google Sign-In failed: ${error.message}`);
       setLoading(false);
     }
     // On success, Supabase redirects via callback, middleware handles session/profile check
   };


  const handleEmailSignIn = async (values) => {
    setLoading(true);
    message.loading({ content: 'Signing in...', key: 'signin' });
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });
    setLoading(false);

    if (error) {
      message.error({ content: `Sign in failed: ${error.message}`, key: 'signin', duration: 5 });
    } else {
      message.success({ content: 'Sign in successful!', key: 'signin', duration: 2 });
      form.resetFields();
      router.push('/'); // Redirect to home or dashboard after successful login
      router.refresh(); // Important to update server components/layout potentially
    }
  };

  return (
    <Spin spinning={loading}>
      <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #d9d9d9', borderRadius: '8px' }}>
         <Title level={3} style={{ textAlign: 'center' }}>Sign In</Title>
        <Form form={form} onFinish={handleEmailSignIn} layout="vertical" requiredMark={false}>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: 'email', message: 'Please input your email!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Sign In with Email
            </Button>
          </Form.Item>
        </Form>
         <Divider>Or</Divider>
        <Button icon={<GoogleOutlined />} block onClick={handleGoogleSignIn} loading={loading}>
          Sign In with Google
        </Button>
         <Typography.Paragraph style={{ textAlign: 'center', marginTop: '20px' }}>
             Don't have an account? <a href="/signup">Sign Up</a>
         </Typography.Paragraph>
      </div>
    </Spin>
  );
}
