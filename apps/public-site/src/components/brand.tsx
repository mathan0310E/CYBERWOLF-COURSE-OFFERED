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
 * Cyber Wolf brand lockup: the official emblem plus the CyberWolf360 wordmark.
 * The emblem is the owner-provided asset at /cyberwolf-logo.png.
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
        className={cn(LOGO_SIZES[size], "rounded-md object-contain")}
        aria-hidden="true"
      />
      <span className={cn("font-bold tracking-wide", TEXT_SIZES[size])}>
        CyberWolf<span className="text-accent">360</span>
      </span>
    </>
  );

  const classes = cn("flex items-center gap-2.5 rounded-md", className);

  if (!asLink) {
    return <span className={classes}>{content}</span>;
  }

  return (
    <Link to="/" className={classes} aria-label="CyberWolf 360 — home">
      {content}
    </Link>
  );
}
