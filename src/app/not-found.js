import Link from 'next/link';
import { PageLayout } from '@/components/layout';

export const metadata = {
  title: 'Page Not Found',
  description: 'The page you are looking for does not exist.',
};

export default function NotFound() {
  return (
    <PageLayout showSidebar={false}>
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <p className="mb-2 text-sm font-medium text-muted-foreground uppercase tracking-widest">
          404
        </p>
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Page not found
        </h1>
        <p className="mb-8 max-w-md text-muted-foreground">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. The page may have been
          moved or no longer exists.
        </p>
        <Link
          href="/"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Back to Home
        </Link>
      </div>
    </PageLayout>
  );
}
