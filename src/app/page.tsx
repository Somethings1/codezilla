"use client";
import React from 'react';
import { Button, Typography, Card, Space } from 'antd';
import Link from 'next/link'; // Use Next.js Link for client-side navigation

const { Title, Paragraph } = Typography;

export default function WelcomePage() {
    // This page is simple, no complex logic needed for now
    // Middleware handles auth check, so we assume we can show this page
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <Card style={{ maxWidth: '500px', textAlign: 'center', padding: '20px' }}>
                <Title level={2}>Welcome to Your LeetCode Clone!</Title>
                <Paragraph>
                    The place where you might, possibly, if you really try, solve some coding problems. Or just look at them. Your choice, really.
                </Paragraph>
                <Paragraph>
                    Get started by signing up or signing in. Good luck. You'll probably need it.
                </Paragraph>
                <Space size="large" style={{ marginTop: '20px' }}>
                    <Link href="/signin" passHref>
                        <Button type="primary" size="large">Sign In</Button>
                    </Link>
                    <Link href="/signup" passHref>
                        <Button size="large">Sign Up</Button>
                    </Link>
                </Space>
            </Card>
        </div>
    );
}
