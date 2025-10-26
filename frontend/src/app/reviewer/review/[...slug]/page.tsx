import { redirect } from 'next/navigation';

interface Props {
  params: { slug: string[] };
}

export default function CatchAllReviewPage({ params }: Props) {
  const raw = Array.isArray(params.slug) ? params.slug.join('/') : String(params.slug);

  // Handle legacy or debug ids like `real-17` or `demo-17` by stripping known prefixes
  const canonical = raw.replace(/^real-/, '').replace(/^demo-/, '');

  // Redirect to the canonical review page. This runs server-side and avoids a 404
  // when the incoming path used a prefixed id.
  redirect(`/reviewer/review/${canonical}`);
}
