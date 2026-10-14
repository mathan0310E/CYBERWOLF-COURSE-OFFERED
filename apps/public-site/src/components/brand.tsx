import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface BrandProps {
  /** Larger lockup for hero/footer contexts. */
  size?: "sm" | "md" | "lg";
  className?: string;
  /** When false the mark is rendered without a wrapping link. */
  asLink?: boolean;
}

const LOGO_SIZES: Record<NonNullable<BrandProps["size"]>, string> = {
  sm: "h-8 w-8",
  md: "h-9 w-9",
  lg: "h-12 w-12",
};

const TEXT_SIZES: Record<NonNullable<BrandProps["size"]>, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-xl",
};

/**
 * Cyber Wolf brand lockup: the owner-provided emblem plus the CyberWolf360
 * wordmark. No invented logo — the emblem is the asset at /cyberwolf-logo.png.
 */
export function Brand({ size = "md", className, asLink = true }: BrandProps) {
  const content = (
    <>
      <img
        src="/cyberwolf-logo.png"
        alt=""
        width={48}
        height={48}
        decoding="async"
        className={cn(LOGO_SIZES[size], "rounded-lg border border-border object-contain")}
        aria-hidden="true"
      />
      <span className={cn("font-display font-semibold tracking-[-0.02em]", TEXT_SIZES[size])}>
        CyberWolf<span className="text-muted">360</span>
      </span>
    </>
  );

  const classes = cn("flex items-center gap-2.5 rounded-sm", className);

  if (!asLink) {
    return <span className={classes}>{content}</span>;
  }

  return (
    <Link to="/" className={classes} aria-label="CyberWolf 360 — home">
      {content}
    </Link>
  );
}

/**
 * Just the emblem, sized by the caller. Used where the wordmark would be
 * redundant (the global nav and footer already spell out the brand).
 */
export function CompanyWordmark({ className }: { className?: string }) {
  return (
    <img
      src="/cyberwolf-logo.png"
      alt=""
      width={40}
      height={40}
      decoding="async"
      className={cn("object-contain", className)}
      aria-hidden="true"
    />
  );
}
