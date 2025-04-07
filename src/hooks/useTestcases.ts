// hooks/useTestcases.ts
'use client';

import { useEffect, useState } from 'react';

export interface Testcase {
    id: string;
    input: string;
    expected_output: string;
    is_hidden: boolean;
    problem_id: number;
}

export function useTestcases(slug: string) {
    const [testcases, setTestcases] = useState<Testcase[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTestcases = async () => {
            try {
                const res = await fetch(`/api/problems/${slug}/testcases`);
                const data = await res.json();
                setTestcases(data.testcases || []);
            } catch (err) {
                console.error('Failed to fetch testcases:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTestcases();
    }, [slug]);

    return { testcases, loading };
}

