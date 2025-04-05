// app/problems/[slug]/description/page.tsx
export default function DescriptionPage({ params }: { params: { slug: string } }) {
  return <div>This is the Description tab for: {params.slug}</div>;
}

