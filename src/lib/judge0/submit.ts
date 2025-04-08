// /lib/judge0/submit.ts
export async function submitToJudge0({ language_id, source_code, stdin, expected_output }) {
    const submissionRes = await fetch('https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-RapidAPI-Key': process.env.JUDGE0_KEY!,
            'X-RapidAPI-Host': process.env.JUDGE0_HOST!,
        },
        body: JSON.stringify({
            language_id,
            source_code,
            stdin,
            expected_output,
        }),
    });

    const submission = await submissionRes.json();
    console.log("--------------------------------");
    console.log(language_id);
    console.log(source_code);
    console.log(stdin);
    console.log(expected_output);
    console.log(submission);
    console.log("--------------------------------");

    return submission;
}

