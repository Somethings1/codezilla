'use client';

import { Select } from 'antd';
import Editor from '@monaco-editor/react';
import { useState, useEffect } from 'react';

const languageTemplates: Record<string, string> = {
  javascript: `function solve() {\n  // Your code here\n  return;\n}`,
  python: `def solve():\n    # Your code here\n    pass`,
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n  // Your code here\n  return 0;\n}`,
  java: `public class Main {\n  public static void main(String[] args) {\n    // Your code here\n  }\n}`,
  go: `package main\n\nimport "fmt"\n\nfunc main() {\n  // Your code here\n  fmt.Println("Hello, Go!")\n}`,
  rust: `fn main() {\n  // Your code here\n  println!("Hello, Rust!");\n}`,
  php: `<?php\n// Your code here\necho "Hello, PHP!";\n?>`,
  swift: `import Foundation\n\n// Your code here\nprint("Hello, Swift!")`,
};

const languageOptions = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'cpp', label: 'C++' },
  { value: 'java', label: 'Java' },
  { value: 'go', label: 'Golang' },
  { value: 'rust', label: 'Rust' },
  { value: 'php', label: 'PHP' },
  { value: 'swift', label: 'Swift' },
];

export default function CodeEditor() {
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(languageTemplates['javascript']);

  useEffect(() => {
    setCode(languageTemplates[language]);
  }, [language]);

  return (
    <div style={{ height: '100%' }}>
      <Select
        style={{ width: 200 }}
        options={languageOptions}
        value={language}
        onChange={setLanguage}
      />

      <Editor
        height="100%"
        language={language}
        value={code}
        onChange={(value) => setCode(value || '')}
        theme="vs-light"
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: 'on',
        }}
      />
    </div>
  );
}

