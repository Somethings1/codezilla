'use client';

import { Panel, PanelGroup } from 'react-resizable-panels';
import { usePathname, useRouter } from 'next/navigation';
import { List, Card, Typography, Tabs, Button, message } from 'antd';
import { ReactNode, use, useState } from 'react';
import { FancyHandle } from '@/components/FancyHandle';
import CodeEditor from '@/components/CodeEditor';
import { useTestcases } from '@/hooks/useTestcases';

const tabs = [
    { label: 'Description', value: 'description' },
    { label: 'Discussion', value: 'discussion' },
    { label: 'Submissions', value: 'submissions' },
];

export default function ProblemLayout({
    children,
    params,
}: {
    children: ReactNode;
    params: Promise<{ slug: string }>;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const { slug } = use(params);
    const { testcases, loading: testcasesLoading } = useTestcases(slug);
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState(63);
    const [outputTab, setOutputTab] = useState('testcase');
    const [output, setOutput] = useState('Click on \`Run code\` to see output');

    const activeKey = tabs.find((tab) =>
        pathname?.endsWith(`/${tab.value}`)
    )?.value ?? 'description';

    const handleTabChange = (key: string) => {
        router.push(`/problems/${slug}/${key}`);
    };

    const handleRunCode = async () => {
        try {
            if (!code || !language) {
                message.warning('Missing code or language.');
                return;
            }

            const publicTestcases = testcases.filter(tc => !tc.is_hidden);

            const response = await fetch('/api/run', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    source_code: code,
                    language_id: language,
                    testcases: publicTestcases,
                    slug,
                }),
            });

            const result = await response.json();

            if (!result.results || !Array.isArray(result.results)) {
                setOutput('No output returned.');
            } else {
                // Map each result to a more readable format
                const formattedOutput = result.results.map((res, index) => {
                    const status = res.status?.description || 'Unknown';
                    const stdout = res.stdout?.trim() || 'No output';
                    const stderr = res.stderr || '';
                    const compileOutput = res.compile_output || '';
                    const extra = stderr || compileOutput;

                    return `Test Case #${index + 1}:\nStatus: ${status}\nOutput: ${stdout}${extra ? `\nError:\n${extra}` : ''}`;
                }).join('\n\n');

                setOutput(formattedOutput);
            }

            setOutputTab('output');
        } catch (err) {
            console.error('Run failed:', err);
            message.error('Something went wrong running your code.');
        }
    };

    return (
        <div style={{ height: '97vh', width: '99vw' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '1rem',
                padding: '1rem',
                background: '#fff',
                border: '1px solid #ddd',
                borderRadius: '6px',
                marginBottom: '0.5rem',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            }}>
                <Button type="primary" onClick={handleRunCode}>Run Code</Button>
                <Button type="default">Submit</Button>
            </div>
            <PanelGroup direction="horizontal">
                {/* LEFT PANE (AntD Tabs) */}
                <Panel defaultSize={50}>
                    <aside
                        style={{
                            height: '100%',
                            padding: '1rem',
                            overflow: 'auto',
                            background: '#fff',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            boxSizing: 'border-box',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                        }}
                    >
                        <h2 style={{ fontSize: '16px' }}>Problem: {slug}</h2>
                        <Tabs
                            tabPosition="top"
                            activeKey={activeKey}
                            onChange={handleTabChange}
                            items={tabs.map((tab) => ({
                                label: tab.label,
                                key: tab.value,
                            }))}
                        />
                        {children}
                    </aside>
                </Panel>

                {/* Horizontal Resize Handle */}
                <FancyHandle direction="horizontal" />

                {/* RIGHT PANE: Two vertical panes */}
                <Panel>
                    <PanelGroup direction="vertical">
                        {/* TOP RIGHT PANE */}
                        <Panel defaultSize={50}>
                            <div
                                style={{
                                    height: '100%',
                                    padding: '1rem',
                                    overflow: 'auto',
                                    background: '#fff',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    boxSizing: 'border-box',
                                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                                }}
                            >
                                {/* Here's your dynamic page content */}
                                <CodeEditor
                                    code={code}
                                    onCodeChange={setCode}
                                    languageId={language}
                                    onLanguageChange={setLanguage}
                                />
                            </div>
                        </Panel>

                        {/* Vertical Resize Handle */}
                        <FancyHandle direction="vertical" />

                        {/* BOTTOM RIGHT PANE */}
                        <Panel>
                            <div
                                style={{
                                    height: '100%',
                                    padding: '1rem',
                                    overflow: 'auto',
                                    background: '#fff',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                                    boxSizing: 'border-box',
                                }}
                            >
                                <Tabs
                                    activeKey={outputTab}
                                    onChange={setOutputTab}
                                    items={[
                                        {
                                            key: 'testcase',
                                            label: '🧾 Testcase',
                                            children: testcasesLoading ? (
                                                <p>Loading testcases...</p>
                                            ) : (
                                                <List
                                                    dataSource={testcases}
                                                    loading={testcasesLoading}
                                                    renderItem={(tc, index) => (
                                                        <List.Item>
                                                            <Card
                                                                title={`Testcase ${index + 1}`}
                                                                bordered
                                                                style={{ width: '100%' }}
                                                            >
                                                                <Typography.Paragraph>
                                                                    <strong>Input:</strong>
                                                                    <pre>{tc.input}</pre>
                                                                </Typography.Paragraph>
                                                                <Typography.Paragraph>
                                                                    <strong>Expected Output:</strong>
                                                                    <pre>{tc.expected_output}</pre>
                                                                </Typography.Paragraph>
                                                            </Card>
                                                        </List.Item>
                                                    )}
                                                />
                                            ),
                                        },
                                        {
                                            key: 'output',
                                            label: '📤 Output',
                                            children: (
                                                <div>
                                                    <pre className="bg-white p-2 rounded border">{output}</pre>
                                                </div>
                                            ),
                                        },
                                    ]}
                                />

                            </div>
                        </Panel>
                    </PanelGroup>
                </Panel>
            </PanelGroup>
        </div>
    );
}

