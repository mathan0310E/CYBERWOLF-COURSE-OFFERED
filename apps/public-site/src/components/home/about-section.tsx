import { Link } from "react-router-dom";
import { COMPANY, COMPANY_ADDRESS_LINE } from "@cyberwolf/shared-types";
import { SocialLinks } from "@/components/social-links";
import { MailIcon, MapPinIcon, PhoneIcon } from "@/components/brand-icons";
import { Section } from "@/components/home/section";

/** About — a main-page section. No invented certifications or placements. */
export function AboutSection() {
  return (
    <Section id="about" eyebrow="About" title={`About ${COMPANY.legalName}`} align="left">
      <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4 text-[17px] leading-relaxed text-muted">
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
            <Link
              to="/enroll"
              className="inline-flex items-center justify-center rounded-pill bg-apple-blue px-6 py-2.5 text-[15px] text-white transition-colors hover:bg-apple-blue-hover"
            >
              Enroll now
            </Link>
            <a
              href="#courses"
              className="inline-flex items-center justify-center rounded-pill border border-apple-blue px-6 py-2.5 text-[15px] text-apple-blue transition-colors hover:bg-apple-blue/5"
            >
              Explore courses
            </a>
          </div>
        </div>

        <aside className="rounded-[18px] bg-background-secondary p-6">
          <div className="flex items-center gap-3">
            <img
              src="/cyberwolf-logo.png"
              alt=""
              width={56}
              height={56}
              className="h-12 w-12 rounded-[12px] object-contain"
            />
            <p className="text-[15px] font-semibold text-foreground">{COMPANY.displayName}</p>
          </div>
          <h3 className="mt-6 text-[14px] font-semibold text-foreground">Contact</h3>
          <ul className="mt-3 space-y-2.5 text-[14px] text-muted">
            <li className="flex items-center gap-2">
              <MailIcon className="h-4 w-4 shrink-0 text-apple-blue" />
              <a href={`mailto:${COMPANY.email}`} className="text-apple-blue hover:underline">
                {COMPANY.email}
              </a>
            </li>
            {COMPANY.phones.map((phone) => (
              <li key={phone} className="flex items-center gap-2">
                <PhoneIcon className="h-4 w-4 shrink-0 text-apple-blue" />
                <a href={`tel:${phone.replace(/\s+/g, "")}`} className="text-apple-blue hover:underline">
                  {phone}
                </a>
              </li>
            ))}
            <li className="flex items-start gap-2">
              <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-apple-blue" />
              <span>{COMPANY_ADDRESS_LINE}</span>
            </li>
          </ul>
          <div className="mt-6">
            <h3 className="text-[14px] font-semibold text-foreground">Follow</h3>
            <SocialLinks className="mt-3" />
          </div>
        </aside>
      </div>
    </Section>
  );
}
