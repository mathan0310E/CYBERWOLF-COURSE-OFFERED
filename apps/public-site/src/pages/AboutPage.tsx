import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { COMPANY } from "@cyberwolf/shared-types";

export function AboutPage() {
  return (
    <div className="container max-w-3xl py-16">
      <img
        src="/cyberwolf-logo.png"
        alt="Cyber Wolf"
        width={72}
        height={72}
        className="h-16 w-16 rounded-lg object-contain"
      />
      <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">About {COMPANY.legalName}</h1>
      <div className="mt-6 space-y-4 text-muted">
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
      </div>

      <div className="mt-8 rounded-lg border border-border bg-card p-5">
        <h2 className="text-sm font-semibold text-foreground">Contact</h2>
        <ul className="mt-3 space-y-1.5 text-sm text-muted">
          <li>
            Email:{" "}
            <a href={`mailto:${COMPANY.email}`} className="text-accent underline underline-offset-2">
              {COMPANY.email}
            </a>
          </li>
          <li>
            Phone:{" "}
            {COMPANY.phones.map((phone, index) => (
              <span key={phone}>
                {index > 0 && ", "}
                <a href={`tel:${phone.replace(/\s+/g, "")}`} className="text-accent underline underline-offset-2">
                  {phone}
                </a>
              </span>
            ))}
          </li>
          <li>
            Address: {COMPANY.address.street}, {COMPANY.address.locality}, {COMPANY.address.region}{" "}
            {COMPANY.address.postalCode}
          </li>
          <li>
            Website:{" "}
            <a
              href={COMPANY.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline underline-offset-2"
            >
              {COMPANY.website.replace(/^https?:\/\//, "")}
            </a>
          </li>
        </ul>
        <div className="mt-3 flex flex-wrap gap-4 text-sm">
          <a
            href={COMPANY.socials.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline underline-offset-2"
          >
            LinkedIn
          </a>
          <a
            href={COMPANY.socials.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline underline-offset-2"
          >
            Instagram
          </a>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild>
          <Link to="/courses">Explore courses</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/enroll">Enroll now</Link>
        </Button>
      </div>
    </div>
  );
}
