'use client';
import { useUser } from '@/hooks/useUser';
import { createClient } from '@/lib/supabase/client';
import { use, useEffect, useState } from 'react';

export default function DiscussionPage({ params }: { params: Promise<{ slug: string }> }) {
    const [comments, setComments] = useState<any[]>([]);
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const user = useUser();
    const { slug } = use(params);
    const supabase = createClient();

    useEffect(() => {
        const fetchComments = async () => {
            const res = await fetch(`/api/problems/${slug}/comments`);
            const data = await res.json();
            setComments(data.comments || []);
            setLoading(false);
        };

        fetchComments();

        // 👀 Realtime subscription
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
                    setComments((prev) => [payload.new, ...prev]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const handlePost = async () => {
        if (!content.trim()) return;
        if (!user?.id) return;

        const res = await fetch(`/api/problems/${slug}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content }), // 👈 we’ll grab user ID in the API route, thank you very much
            credentials: 'include',
        });

        const data = await res.json();
        if (res.ok) {
            setComments([data.comment, ...comments]);
            setContent('');
        } else {
            alert(`Failed to post comment: ${data.error}`);
        }
    };

    return (
        <div>
            <h2>🗣 Discussion</h2>

            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts..."
                rows={4}
                className="w-full border rounded px-3 py-2 mb-2"
            />

            <button onClick={handlePost} className="bg-blue-600 text-white px-4 py-2 rounded">
                Post
            </button>

            {loading ? (
                <p>Loading comments...</p>
            ) : comments.length === 0 ? (
                <p>No comments yet.</p>
            ) : (
                <ul className="mt-4 space-y-4">
                    {comments.map((comment) => (
                        <li key={comment.id} className="border p-3 rounded">
                            <div className="text-sm text-gray-500">
                                {comment.user_id} • {new Date(comment.created_at).toLocaleString()}
                            </div>
                            <div>{comment.content}</div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

