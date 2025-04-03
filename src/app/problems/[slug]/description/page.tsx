'use client';
import { use, useEffect, useState } from 'react';

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
      <h2>{problem.title}</h2>
      <p><strong>Difficulty:</strong> {problem.difficulty?.difficulty_name}</p>
      <div dangerouslySetInnerHTML={{ __html: problem.description }} />
      <div>
        <strong>Tags:</strong>{' '}
        {problem.tags?.map((t: any) => t.tag.tag_name).join(', ')}
      </div>
    </div>
  );
}

