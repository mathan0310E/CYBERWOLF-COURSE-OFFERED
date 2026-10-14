import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <div className="container relative flex min-h-[50vh] flex-col items-center justify-center py-24 text-center">
      <p className="font-display text-[64px] leading-none">404</p>
      <h1 className="mt-4 text-3xl tracking-tight">Page not found</h1>
      <p className="mt-3 max-w-md text-muted">
        The page you are looking for does not exist or has moved.
      </p>
      <Button asChild data-arrow="true" className="mt-6">
        <Link to="/">Back to home</Link>
      </Button>
    </div>
  );
}
