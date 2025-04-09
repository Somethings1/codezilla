'use client';

import { Select } from 'antd';
import Editor from '@monaco-editor/react';
import { useState, useEffect } from 'react';
import getMonacoLanguageFromId from '@/lib/utils/monacoLanguageFromId';

const languageTemplates: Record<number, string> = {
  63: `function solve() {\n  // Your code here\n  return;\n}`,
  71: `def solve():\n    # Your code here\n    pass`,
  54: `#include <iostream>\nusing namespace std;\n\nint main() {\n  // Your code here\n  return 0;\n}`,
  62: `public class Main {\n  public static void main(String[] args) {\n    // Your code here\n  }\n}`,
  60: `package main\n\nimport "fmt"\n\nfunc main() {\n  // Your code here\n  fmt.Println("Hello, Go!")\n}`,
  73: `fn main() {\n  // Your code here\n  println!("Hello, Rust!");\n}`,
  68: `<?php\n// Your code here\necho "Hello, PHP!";\n?>`,
  83: `import Foundation\n\n// Your code here\nprint("Hello, Swift!")`,
};
const languageOptions = [
  { value: 63, label: 'JavaScript' },   // Node.js
  { value: 71, label: 'Python' },       // Python 3
  { value: 54, label: 'C++' },          // C++ (GCC 9.2.0)
  { value: 62, label: 'Java' },         // Java (OpenJDK 13)
  { value: 60, label: 'Golang' },       // Go (1.13.1)
  { value: 73, label: 'Rust' },         // Rust
  { value: 68, label: 'PHP' },          // PHP
  { value: 83, label: 'Swift' },        // Swift
];

export default function CodeEditor({
  code,
  onCodeChange,
  languageId,
  onLanguageChange,
}: {
  code: string;
  onCodeChange: (value: string) => void;
  languageId: number;
  onLanguageChange: (id: number) => void;
}) {
  useEffect(() => {
    onCodeChange(languageTemplates[languageId]);
  }, [languageId]);

  return (
    <div style={{ height: '100%' }}>
      <Select
        style={{ width: 100 }}
        options={languageOptions}
        value={languageId}
        onChange={onLanguageChange}
      />
      <Editor
        height="100%"
        language={getMonacoLanguageFromId(languageId)}
        value={code}
        onChange={(value) => onCodeChange(value || '')}
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

