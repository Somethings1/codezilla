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

export default function ProblemLayout({ children, params }: { children: ReactNode; params: Promise<{ slug: string }> }) {
  const pathname = usePathname();
  const router = useRouter();
  const { slug } = use(params);
  const { testcases, loading: testcasesLoading } = useTestcases(slug);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState(63);
  const [outputTab, setOutputTab] = useState('testcase');
  const [output, setOutput] = useState('Click on `Run code` to see output');

  const activeKey = tabs.find((tab) => pathname?.endsWith(`/${tab.value}`))?.value ?? 'description';

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source_code: code, language_id: language, testcases: publicTestcases, slug }),
      });

      const result = await response.json();
      if (!result.results || !Array.isArray(result.results)) {
        setOutput('No output returned.');
      } else {
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

  const handleSubmitCode = async () => {
    try {
      if (!code || !language) {
        message.warning('Please write some code and select a language.');
        return;
      }
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source_code: code, language_id: language, slug }),
      });

      const result = await response.json();
      if (!response.ok || !result || result.error) {
        message.error('Submission failed.');
        return;
      }

      message.success('Submission sent successfully. Redirecting to submissions...');
      router.push(`/problems/${slug}/submissions`);
    } catch (error) {
      console.error('Submit failed:', error);
      message.error('Something went wrong submitting your code.');
    }
  };

  return (
    <div style={{ height: '100vh', width: '99vw', padding: 10 }}>
      {/* Header */}
      <Card
        bordered
        style={{ marginBottom: 10 }}
        bodyStyle={{ padding: 10, display: 'flex', justifyContent: 'center', gap: '1rem'}}
        >
        <Button type="primary" onClick={handleRunCode}>Run Code</Button>
        <Button type="default" onClick={handleSubmitCode}>Submit</Button>
      </Card>

      {/* Resizable Panels */}
      <PanelGroup direction="horizontal" style={{ height: '91vh' }}>
        {/* LEFT Panel */}
        <Panel defaultSize={50}>
          <Card bordered style={{ height: '100%' }} bodyStyle={{ padding: 10 }}>
            <Tabs
              tabPosition="top"
              activeKey={activeKey}
              onChange={handleTabChange}
              items={tabs.map((tab) => ({
                label: tab.label,
                key: tab.value,
              }))}
              style={{ height: '100%', overflow: 'auto', paddingInline: '1rem' }}
            />
            <div style={{ padding: '1rem', overflowY: 'auto', height: 'calc(100% - 48px)' }}>
              {children}
            </div>
          </Card>
        </Panel>

        {/* Horizontal Resize Handle */}
        <FancyHandle direction="horizontal" />

        {/* RIGHT Panel */}
        <Panel>
          <PanelGroup direction="vertical">
            {/* Code Editor */}
            <Panel defaultSize={50}>
              <Card bordered style={{ height: '100%' }} bodyStyle={{ height: '100%', padding: 10 }}>
                  <CodeEditor
                    code={code}
                    onCodeChange={setCode}
                    languageId={language}
                    onLanguageChange={setLanguage}
                  />
              </Card>
            </Panel>

            {/* Vertical Resize Handle */}
            <FancyHandle direction="vertical" />

            {/* Testcase/Output Panel */}
            <Panel>
              <Card bordered style={{ height: '100%', overflow: 'auto' }} bodyStyle={{ padding: 10 }}>
                <Tabs
                  activeKey={outputTab}
                  onChange={setOutputTab}
                  items={[
                    {
                      key: 'testcase',
                      label: '🧾 Testcase',
                      children: testcasesLoading ? (
                        <Typography.Text>Loading testcases...</Typography.Text>
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
                        <Typography.Paragraph>
                          <pre>{output}</pre>
                        </Typography.Paragraph>
                      ),
                    },
                  ]}
                  style={{ height: '100%', overflow: 'auto', padding: '1rem' }}
                />
              </Card>
            </Panel>
          </PanelGroup>
        </Panel>
      </PanelGroup>
    </div>
  );
}

