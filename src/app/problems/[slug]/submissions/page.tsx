'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, Tag, Typography, Spin, Collapse } from 'antd';
import { Editor } from '@monaco-editor/react';
import getMonacoLanguageFromId from '@/lib/utils/monacoLanguageFromId';

const { Text } = Typography;
const { Panel } = Collapse;

interface Submission {
    id: number;
    status_name: string;
    execution_time: number | null;
    submitted_at: string;
    language: string;
    code: string;
}

export default function SubmissionsPage() {
    const { slug } = useParams<{ slug: string }>();
    const supabase = createClient();
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let currentUserId: string;

        const fetchSubmissions = async () => {
            setLoading(true);

            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();

            if (userError || !user) {
                console.error('Failed to get user:', userError);
                return setLoading(false);
            }

            currentUserId = user.id;

            const { data, error } = await supabase
                .from('submissions')
                .select(`
          id,
          status:submission_statuses(status_name),
          code,
          execution_time,
          submitted_at,
          language
        `)
                .eq('problem_id', slug)
                .eq('user_id', currentUserId)
                .order('submitted_at', { ascending: false });

            if (error) {
                console.error('Error fetching submissions:', error);
            } else {
                const formattedData = data.map((item: any) => ({
                    id: item.id,
                    status_name: item.status.status_name,
                    execution_time: item.execution_time,
                    submitted_at: item.submitted_at,
                    language: item.language,
                    code: item.code,
                }));
                setSubmissions(formattedData);
            }

            setLoading(false);
        };

        fetchSubmissions();

        // Real-time subscription
        const channel = supabase
            .channel('submissions-updates')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'submissions',
                    filter: `problem_id=eq.${slug}`,
                },
                async (payload) => {
                    const { user } = await supabase.auth.getUser();
                    if (user?.id === payload.new.user_id) {
                        fetchSubmissions();
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [slug]);

    const getStatusTag = (status: string) => {
        let color = 'default';
        if (status === 'Accepted') color = 'green';
        else if (status === 'Wrong Answer') color = 'red';
        else if (status === 'Pending') color = 'orange';
        return <Tag color={color}>{status}</Tag>;
    };

    return (
        <div style={{ padding: '1rem' }}>
            <h2>Submissions for Problem: {slug}</h2>
            {loading ? (
                <Spin size="large" />
            ) : submissions.length === 0 ? (
                <Text>No submissions yet.</Text>
            ) : (
                submissions.map((submission) => (
                    <Card
                        key={submission.id}
                        style={{ marginBottom: '1rem', width: '100%' }}
                        title={`Submission ID: ${submission.id}`}
                        extra={getStatusTag(submission.status_name)}
                        bordered={false}
                        hoverable
                    >
                        <p>
                            <strong>Language:</strong> {getMonacoLanguageFromId(Number(submission.language))}
                        </p>
                        <p>
                            <strong>Execution Time:</strong>{' '}
                            {submission.execution_time ? submission.execution_time.toFixed(3) : 'N/A'}s
                        </p>
                        <p>
                            <strong>Submitted At:</strong>{' '}
                            {new Date(submission.submitted_at).toLocaleString()}
                        </p>
                        <Collapse ghost>
                            <Panel header="View Code" key="1">
                                <div style={{ height: '300px', borderRadius: '6px', overflow: 'hidden' }}>
                                    <Editor
                                        height="100%"
                                        width="100%"
                                        language={getMonacoLanguageFromId(Number(submission.language))}
                                        value={submission.code}
                                        options={{
                                            readOnly: true,
                                            minimap: { enabled: false },
                                            lineNumbers: 'on',
                                            scrollBeyondLastLine: false,
                                            wordWrap: 'on',
                                            fontSize: 14,
                                        }}
                                    />
                                </div>
                            </Panel>
                        </Collapse>
                    </Card>
                ))
            )}
        </div>
    );
}

