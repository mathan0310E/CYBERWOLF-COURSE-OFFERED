import { cn } from "@/lib/utils";

interface BrandProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Render a subdued "Administration" suffix after the wordmark. */
  admin?: boolean;
}

const LOGO_SIZES = { sm: "h-7 w-7", md: "h-8 w-8", lg: "h-12 w-12" } as const;
const TEXT_SIZES = { sm: "text-sm", md: "text-sm", lg: "text-xl" } as const;

/**
 * Cyber Wolf brand lockup for the private admin application. Uses the official
 * owner-provided emblem at /cyberwolf-logo.png.
 */
export function Brand({ size = "md", className, admin = false }: BrandProps) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <img
        src="/cyberwolf-logo.png"
        alt=""
        width={48}
        height={48}
        decoding="async"
        className={cn(LOGO_SIZES[size], "rounded-md object-contain")}
        aria-hidden="true"
      />
      <span className={cn("font-bold", TEXT_SIZES[size])}>
        CyberWolf<span className="text-accent">360</span>
        {admin && <span className="ml-1 font-normal text-muted">Administration</span>}
      </span>
    </span>
  );
}
