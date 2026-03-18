import Link from "next/link";

export default function NotFound() {
  return (
    <div className="not-found">
      <div className="not-found__inner">
        <div className="not-found__emoji">🔍</div>
        <h1 className="not-found__title">Page Not Found</h1>
        <p className="not-found__sub">The page you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        <div className="not-found__btns">
          <Link href="/" className="btn btn-primary">Go Home</Link>
          <Link href="/browse" className="btn btn-secondary">Browse Ads</Link>
        </div>
      </div>
    </div>
  );
}
