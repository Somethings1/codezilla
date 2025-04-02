'use client';

import { Panel, PanelGroup } from 'react-resizable-panels';
import { usePathname, useRouter } from 'next/navigation';
import { Tabs } from 'antd';
import { ReactNode, use } from 'react';
import { FancyHandle } from '@/components/FancyHandle';

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

    const activeKey = tabs.find((tab) =>
        pathname?.endsWith(`/${tab.value}`)
    )?.value ?? 'description';

    const handleTabChange = (key: string) => {
        router.push(`/problems/${slug}/${key}`);
    };

    return (
        <div style={{ height: '97vh', width: '99vw' }}>
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
                                <h3>🧪 Test Output</h3>
                                <p>Where you’ll watch your code cry.</p>
                            </div>
                        </Panel>
                    </PanelGroup>
                </Panel>
            </PanelGroup>
        </div>
    );
}

