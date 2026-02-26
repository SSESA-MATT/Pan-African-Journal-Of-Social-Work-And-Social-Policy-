import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* African-inspired decorative dots */}
        <div className="flex justify-center items-center space-x-2 mb-8">
          <div className="w-2 h-2 bg-accent-red rounded-full" />
          <div className="w-3 h-3 bg-accent-green rounded-full" />
          <div className="w-2 h-2 bg-neutral-800 rounded-full" />
          <div className="w-4 h-4 bg-accent-red rounded-full" />
          <div className="w-2 h-2 bg-accent-green rounded-full" />
          <div className="w-3 h-3 bg-neutral-800 rounded-full" />
          <div className="w-2 h-2 bg-accent-red rounded-full" />
        </div>

        <h1 className="text-8xl font-bold text-accent-green mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-neutral-800 mb-4">Page Not Found</h2>
        <p className="text-neutral-600 mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-accent-green text-white rounded-md hover:bg-accent-green/80 transition-colors font-medium"
          >
            Go Home
          </Link>
          <Link
            href="/articles"
            className="px-6 py-3 border border-neutral-300 text-neutral-700 rounded-md hover:bg-neutral-50 transition-colors font-medium"
          >
            Browse Articles
          </Link>
          <Link
            href="/search"
            className="px-6 py-3 border border-neutral-300 text-neutral-700 rounded-md hover:bg-neutral-50 transition-colors font-medium"
          >
            Search
          </Link>
        </div>
      </div>
    </div>
  );
}
