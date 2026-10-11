import { Link } from "react-router-dom";
import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";
import { COMPANY, COMPANY_ADDRESS_LINE } from "@cyberwolf/shared-types";
import { SocialLinks } from "@/components/social-links";
import { Section } from "@/components/home/section";
import { Reveal } from "@/components/motion/reveal";

/** About — a main-page section. No invented certifications or placements. */
export function AboutSection() {
  return (
    <Section id="about" eyebrow="// about" title={`About ${COMPANY.legalName}`} align="left">
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
          <p className="font-semibold text-foreground">{COMPANY.tagline}</p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to="/enroll"
              className="inline-flex items-center gap-2 rounded-pill bg-neon px-6 py-2.5 text-[15px] text-[#04121A] transition-colors hover:bg-neon/90"
            >
              Enroll now
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <a
              href="#courses"
              className="inline-flex items-center justify-center rounded-pill border border-neon/60 px-6 py-2.5 text-[15px] text-neon transition-colors hover:bg-neon/10"
            >
              Explore courses
            </a>
          </div>
        </Reveal>

        <Reveal
          from="left"
          delay={0.1}
          className="glass rounded-[18px] p-6 shadow-card"
          as="div"
        >
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
          <h3 className="mt-6 font-mono text-[12px] uppercase tracking-widest text-neon">Contact</h3>
          <ul className="mt-3 space-y-2.5 text-[14px] text-muted">
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0 text-neon" aria-hidden="true" />
              <a href={`mailto:${COMPANY.email}`} className="hover:text-neon hover:underline">
                {COMPANY.email}
              </a>
            </li>
            {COMPANY.phones.map((phone) => (
              <li key={phone} className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-neon" aria-hidden="true" />
                <a href={`tel:${phone.replace(/\s+/g, "")}`} className="hover:text-neon hover:underline">
                  {phone}
                </a>
              </li>
            ))}
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-neon" aria-hidden="true" />
              <span>{COMPANY_ADDRESS_LINE}</span>
            </li>
          </ul>
          <div className="mt-6">
            <h3 className="font-mono text-[12px] uppercase tracking-widest text-neon">Follow</h3>
            <SocialLinks className="mt-3" />
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
