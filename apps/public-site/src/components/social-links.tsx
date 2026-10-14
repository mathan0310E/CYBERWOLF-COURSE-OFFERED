import { COMPANY } from "@cyberwolf/shared-types";
import { InstagramIcon, LinkedinIcon, WhatsappIcon } from "@/components/brand-icons";
import { cn } from "@/lib/utils";

const SOCIALS = [
  { key: "linkedin", label: "LinkedIn", href: COMPANY.socials.linkedin, Icon: LinkedinIcon },
  { key: "instagram", label: "Instagram", href: COMPANY.socials.instagram, Icon: InstagramIcon },
  { key: "whatsapp", label: "WhatsApp", href: COMPANY.socials.whatsapp, Icon: WhatsappIcon },
] as const;

/**
 * Icon-only social links. Each link is labelled for assistive technology
 * (`aria-label`) and carries a `title` tooltip for pointer users.
 */
export function SocialLinks({ className }: { className?: string }) {
  return (
    <ul className={cn("flex flex-wrap items-center gap-2", className)}>
      {SOCIALS.map((social) => (
        <li key={social.key}>
          <a
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`CyberWolf 360 on ${social.label}`}
            title={social.label}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card transition-colors hover:bg-background-secondary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/25"
          >
            <social.Icon className="h-4 w-4" />
          </a>
        </li>
      ))}
    </ul>
  );
}
