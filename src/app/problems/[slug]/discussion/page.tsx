'use client';
import { useUser } from '@/hooks/useUser';
import { createClient } from '@/lib/supabase/client';
import { use, useEffect, useState } from 'react';
import { Card, Avatar, List, Input, Button, Spin, Typography } from 'antd';
import { randomColor } from '@/lib/utils/randomColor';

const { TextArea } = Input;
const { Title } = Typography;

export default function DiscussionPage({ params }: { params: Promise<{ slug: string }> }) {
    const [comments, setComments] = useState<any[]>([]);
    const [userMap, setUserMap] = useState<Record<string, string>>({});
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const user = useUser();
    const { slug } = use(params);
    const supabase = createClient();

    useEffect(() => {
        const fetchCommentsAndUsers = async () => {
            const res = await fetch(`/api/problems/${slug}/comments`);
            const data = await res.json();
            const commentList = data.comments || [];
            setComments(commentList);

            // 🤓 Fetch usernames for unique user_ids
            const userIds = [...new Set(commentList.map((c: any) => c.user_id))];

            const { data: profiles, error } = await supabase
                .from('profiles')
                .select('id, username')
                .in('id', userIds);

            if (!error && profiles) {
                const map: Record<string, string> = {};
                profiles.forEach((p) => {
                    map[p.id] = p.username || `User_${p.id.slice(0, 6)}`;
                });
                setUserMap(map);
            }

            setLoading(false);
        };

        fetchCommentsAndUsers();

        // Realtime: because stalking is a feature now
        const channel = supabase
            .channel('realtime-comments')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'comments',
                    filter: `problem_id=eq.${slug}`,
                },
                (payload) => {
                    const newComment = payload.new;
                    setComments((prev) => [newComment, ...prev]);

                    // 🌱 Fetch username for the new guy if needed
                    if (!userMap[newComment.user_id]) {
                        supabase
                            .from('profiles')
                            .select('id, username')
                            .eq('id', newComment.user_id)
                            .single()
                            .then(({ data }) => {
                                if (data) {
                                    setUserMap((prev) => ({
                                        ...prev,
                                        [data.id]: data.username || `User_${data.id.slice(0, 6)}`,
                                    }));
                                }
                            });
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const handlePost = async () => {
        if (!content.trim() || !user?.id) return;

        const res = await fetch(`/api/problems/${slug}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content }),
            credentials: 'include',
        });

        const data = await res.json();
        if (res.ok) {
            setContent('');
        } else {
            alert(`Failed to post comment: ${data.error}`);
        }
    };

    return (
        <div style={{ padding: '1rem' }}>
            <Title level={4}>🗣 Discussion</Title>

            <TextArea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts..."
                rows={4}
                style={{ marginBottom: '1rem' }}
            />
            <Button type="primary" onClick={handlePost}>
                Post
            </Button>

            {loading ? (
                <Spin style={{ marginTop: '2rem' }} />
            ) : comments.length === 0 ? (
                <p style={{ marginTop: '2rem' }}>No comments yet.</p>
            ) : (
                <List
                    itemLayout="horizontal"
                    dataSource={comments}
                    renderItem={(item) => (
                        <List.Item>
                            <Card style={{ width: '100%' }}>
                                <List.Item.Meta
                                    avatar={
                                        <Avatar style={{ backgroundColor: randomColor(item.user_id) }}>
                                            {userMap[item.user_id]?.[0]?.toUpperCase() || 'U'}
                                        </Avatar>
                                    }
                                    title={<Typography.Text strong>{userMap[item.user_id] || 'Unknown User'}</Typography.Text>}
                                    description={
                                        <>
                                            <Typography.Paragraph>{item.content}</Typography.Paragraph>
                                            <Typography.Text type="secondary">
                                                {new Date(item.created_at).toLocaleString()}
                                            </Typography.Text>
                                        </>
                                    }
                                />
                            </Card>
                        </List.Item>
                    )}
                />
            )}
        </div>
    );
}

