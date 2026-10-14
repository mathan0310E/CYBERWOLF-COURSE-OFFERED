import { Link } from "react-router-dom";
import { Mail, MapPin, Phone } from "lucide-react";
import { COMPANY, COMPANY_ADDRESS_LINE } from "@cyberwolf/shared-types";
import { SocialLinks } from "@/components/social-links";
import { Section } from "@/components/home/section";
import { Reveal } from "@/components/motion/reveal";

/** About — a main-page section. No invented certifications or placements. */
export function AboutSection() {
  return (
    <Section id="about" eyebrow="About" title={`About ${COMPANY.legalName}`} align="left">
      <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <Reveal from="right" className="space-y-4 text-[17px] leading-relaxed text-muted">
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
          <p className="font-display text-[20px] italic text-foreground">{COMPANY.tagline}</p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to="/enroll"
              data-arrow="true"
              className="inline-flex items-center justify-center rounded-pill border border-border bg-ink px-6 py-3 text-[15px] font-semibold text-[#F5F2EB] transition-colors hover:bg-[#3A3A3A]"
            >
              Enroll now
            </Link>
            <a
              href="#courses"
              className="inline-flex items-center justify-center rounded-pill border border-border bg-card px-6 py-3 text-[15px] font-semibold transition-colors hover:bg-background-secondary"
            >
              Explore courses
            </a>
          </div>
        </Reveal>

        <Reveal from="left" delay={0.1} className="rounded-lg border border-border bg-card p-6 shadow-card" as="div">
          <div className="flex items-center gap-3">
            <img
              src="/cyberwolf-logo.png"
              alt=""
              width={56}
              height={56}
              className="h-12 w-12 rounded-lg border border-border object-contain"
            />
            <p className="text-[16px] font-semibold">{COMPANY.displayName}</p>
          </div>
          <h3 className="mt-6 font-sans text-[12px] font-semibold uppercase tracking-[0.16em] text-muted">
            Contact
          </h3>
          <ul className="mt-3 space-y-2.5 text-[14px] text-muted">
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
              <a href={`mailto:${COMPANY.email}`} className="hover:underline">
                {COMPANY.email}
              </a>
            </li>
            {COMPANY.phones.map((phone) => (
              <li key={phone} className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
                <a href={`tel:${phone.replace(/\s+/g, "")}`} className="hover:underline">
                  {phone}
                </a>
              </li>
            ))}
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{COMPANY_ADDRESS_LINE}</span>
            </li>
          </ul>
          <div className="mt-6">
            <h3 className="font-sans text-[12px] font-semibold uppercase tracking-[0.16em] text-muted">Follow</h3>
            <SocialLinks className="mt-3" />
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
