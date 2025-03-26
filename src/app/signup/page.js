'use client';
import { useState } from 'react';
import { Button, Form, Input, message, Spin, Typography, Divider } from 'antd';
import { GoogleOutlined } from '@ant-design/icons';
import { createClient } from '@/lib/supabase/client'; // Adjust path
import { useRouter } from 'next/navigation';

const { Title } = Typography;

export default function SignUpPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`, // Supabase handles this redirect usually
      },
    });
    if (error) {
      message.error(`Google Sign-In failed: ${error.message}`);
      setLoading(false);
    }
    // No need to setLoading(false) on success, Supabase redirects
  };

  const handleEmailSignUp = async (values) => {
    setLoading(true);
    message.loading({ content: 'Creating account...', key: 'signup' });
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      message.success({ content: 'Signup successful! Check email.', key: 'signup', duration: 5 });
      form.resetFields();
      // Optionally redirect to login or a success page
      // router.push('/signin');

    } catch (error) {
      message.error({ content: `Signup failed: ${error.message}`, key: 'signup', duration: 5 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Spin spinning={loading}>
      <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #d9d9d9', borderRadius: '8px' }}>
        <Title level={3} style={{ textAlign: 'center' }}>Sign Up</Title>
        <Form form={form} onFinish={handleEmailSignUp} layout="vertical" requiredMark={false}>
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: 'Please input your desired username!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: 'email', message: 'Please input a valid email!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, min: 6, message: 'Password must be at least 6 characters!' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Sign Up with Email
            </Button>
          </Form.Item>
        </Form>
        <Divider>Or</Divider>
        <Button icon={<GoogleOutlined />} block onClick={handleGoogleSignIn} loading={loading}>
          Sign Up with Google
        </Button>
         <Typography.Paragraph style={{ textAlign: 'center', marginTop: '20px' }}>
            Already have an account? <a href="/signin">Sign In</a>
         </Typography.Paragraph>
      </div>
    </Spin>
  );
}
