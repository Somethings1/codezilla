// app/problems/[slug]/page.tsx
import { redirect } from 'next/navigation';

export default function RedirectToDefaultTab({ params }: { params: { slug: string } }) {
  redirect(`/problems/${params.slug}/description`);
}

