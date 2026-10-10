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
          {COMPANY.legalName} is a cybersecurity company that provides security services, training and programs for
          startups, enterprises and institutions. This site covers the course registration track of{" "}
          {COMPANY.displayName}.
        </p>
        <p>
          The courses offered here are <strong className="text-foreground">Cyber Security</strong>,{" "}
          <strong className="text-foreground">AI &amp; Web Development</strong>, and{" "}
          <strong className="text-foreground">Ethical Hacking</strong>. Our aim is to help learners develop practical
          knowledge and a stronger understanding of modern digital technologies.
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
