'use client';
import { use, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css'; // pick a theme, any theme

export default function DescriptionPage({ params }: { params: Promise<{ slug: string }> }) {
    const [problem, setProblem] = useState<any>(null);
    const { slug } = use(params);

    useEffect(() => {
        fetch(`/api/problems/${slug}`)
            .then((res) => res.json())
            .then((data) => setProblem(data.problem));
    }, [slug]);

    if (!problem) return <p>Loading...</p>;

    return (
        <div>
            <h2>{slug + '. ' + problem.title}</h2>
            <p><strong>Difficulty:</strong> {problem.difficulty?.difficulty_name}</p>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
            >{problem.description}</ReactMarkdown>
            <div>
                <strong>Tags:</strong>{' '}
                {problem.tags?.map((t: any) => t.tag.tag_name).join(', ')}
            </div>
        </div>
    );
}

