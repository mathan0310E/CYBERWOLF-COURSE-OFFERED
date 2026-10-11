import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { COMPANY, COMPANY_ADDRESS_LINE } from "@cyberwolf/shared-types";
import { SocialLinks } from "@/components/social-links";
import { MailIcon, MapPinIcon, PhoneIcon } from "@/components/brand-icons";
import { Section } from "@/components/home/section";

/** About — a main-page section. No invented certifications or placements. */
export function AboutSection() {
  return (
    <Section id="about" eyebrow="About" title={`About ${COMPANY.legalName}`} align="left">
      <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4 text-muted">
          <p>
            <strong className="text-foreground">{COMPANY.legalName}</strong> — {COMPANY.servicesTagline}.{" "}
            {COMPANY.description} Founded by {COMPANY.founder.name} ({COMPANY.founder.jobTitle}), Cyber Wolf works with
            startups, enterprises and institutions.
          </p>
          <p>
            This site covers the <strong className="text-foreground">course registration track</strong> of{" "}
            {COMPANY.displayName}. The courses offered here are{" "}
            <strong className="text-foreground">Cyber Security</strong>,{" "}
            <strong className="text-foreground">AI &amp; Web Development</strong>, and{" "}
            <strong className="text-foreground">Ethical Hacking</strong>. Our aim is to help learners — especially
            college students — develop practical knowledge and a stronger understanding of modern digital technologies.
          </p>
          <p>
            We keep our descriptions general and honest. We do not publish course durations, detailed syllabi, trainer
            biographies, certifications, placement promises or testimonials on this site unless they have been verified.
          </p>
          <p className="font-semibold text-foreground">{COMPANY.tagline}</p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild>
              <Link to="/enroll">Enroll now</Link>
            </Button>
            <Button asChild variant="outline">
              <a href="#courses">Explore courses</a>
            </Button>
          </div>
        </div>

        <aside className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <img
              src="/cyberwolf-logo.png"
              alt="Cyber Wolf"
              width={56}
              height={56}
              className="h-14 w-14 rounded-lg object-contain"
            />
            <p className="text-sm font-semibold text-foreground">{COMPANY.displayName}</p>
          </div>
          <h3 className="mt-5 text-sm font-semibold text-foreground">Contact</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li className="flex items-center gap-2">
              <MailIcon className="h-4 w-4 shrink-0 text-accent" />
              <a href={`mailto:${COMPANY.email}`} className="text-accent underline underline-offset-2">
                {COMPANY.email}
              </a>
            </li>
            {COMPANY.phones.map((phone) => (
              <li key={phone} className="flex items-center gap-2">
                <PhoneIcon className="h-4 w-4 shrink-0 text-accent" />
                <a href={`tel:${phone.replace(/\s+/g, "")}`} className="text-accent underline underline-offset-2">
                  {phone}
                </a>
              </li>
            ))}
            <li className="flex items-start gap-2">
              <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <span>{COMPANY_ADDRESS_LINE}</span>
            </li>
          </ul>
          <div className="mt-5">
            <h3 className="text-sm font-semibold text-foreground">Follow</h3>
            <SocialLinks className="mt-3" />
          </div>
        </aside>
      </div>
    </Section>
  );
}
