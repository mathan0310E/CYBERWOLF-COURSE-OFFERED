import { motion, useReducedMotion } from "framer-motion";
import { BadgeCheck, GraduationCap, MailCheck, ShieldCheck } from "lucide-react";
import { COURSES } from "@cyberwolf/shared-types";
import { Seo } from "@/components/seo";
import { formatINR, SINGLE_COURSE_OFFER_PRICE } from "@cyberwolf/pricing";
import { StatsBand } from "@/components/home/stats-band";
import { CoursesSection } from "@/components/home/courses-section";
import { WhySection } from "@/components/home/why-section";
import { HowItWorks } from "@/components/home/how-it-works";
import { PricingSection } from "@/components/home/pricing-section";
import { AboutSection } from "@/components/home/about-section";
import { FaqSection } from "@/components/home/faq-section";
import { CtaBanner } from "@/components/home/cta-banner";
import { CountUp } from "@/components/motion/count-up";
import { courseIcon } from "@/components/course-icons";
import { cn } from "@/lib/utils";

const TRUST = [
  { icon: GraduationCap, label: "For college students" },
  { icon: BadgeCheck, label: "Choose one or two courses" },
  { icon: MailCheck, label: "Confirmation by email" },
];

const COLLAGE_ACCENTS = ["bg-sky", "bg-butter", "bg-lilac"];
const COLLAGE_TILT = ["-rotate-3", "rotate-2", "-rotate-2"];

/**
 * The main page. Courses, Pricing, About and FAQ are rendered here as in-page
 * sections (anchor targets), not as separate routes. Only the registration form
 * lives on its own route (/enroll).
 */
export function HomePage() {
  const reduce = useReducedMotion();

  const enter = (delay = 0) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 22 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <>
      <Seo
        title="CyberWolf 360 — Cyber Security, AI & Ethical Hacking Courses"
        description="Explore CyberWolf 360 courses in Cyber Security, AI & Web Development and Ethical Hacking. Student registration with transparent pricing."
        path="/"
      />

      {/* Hero — cream paper surface, oversized editorial headline, pastel collage. */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-[1180px] px-6 pb-16 pt-10 md:pt-16">
          <motion.p {...enter(0)} className="eyebrow">
            CyberWolf 360 — course registration
          </motion.p>
          <motion.h1
            {...enter(0.05)}
            className="mt-6 max-w-4xl text-[46px] leading-[0.98] tracking-[-0.03em] sm:text-[72px] lg:text-[88px]"
          >
            Learn. <span className="display-accent">Secure.</span> Build.
          </motion.h1>
          <motion.p
            {...enter(0.1)}
            className="mt-7 max-w-2xl font-display text-[22px] leading-snug sm:text-[28px]"
          >
            Build Your Skills in Cybersecurity, Ethical Hacking and AI.
          </motion.p>
          <motion.p {...enter(0.15)} className="mt-5 max-w-xl text-[17px] leading-relaxed text-muted">
            Explore technology courses designed to help you develop practical knowledge and strengthen your
            understanding of modern digital technologies.
          </motion.p>

          <motion.div {...enter(0.2)} className="mt-9 flex flex-wrap items-center gap-4">
            <a
              href="#courses"
              data-arrow="true"
              className="inline-flex items-center justify-center rounded-pill border border-border bg-ink px-7 py-3.5 text-[16px] font-semibold text-[#F5F2EB] transition-colors hover:bg-[#3A3A3A]"
            >
              Explore Courses
            </a>
            <a
              href="#pricing"
              data-arrow="true"
              className="inline-flex items-center justify-center rounded-pill border border-border bg-lilac px-7 py-3.5 text-[16px] font-semibold transition-colors hover:bg-[#d0b7f5]"
            >
              View Pricing
            </a>
          </motion.div>

          <motion.ul {...enter(0.25)} className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-3">
            {TRUST.map((item) => (
              <li key={item.label} className="flex items-center gap-2 text-[14px] text-muted">
                <item.icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </li>
            ))}
          </motion.ul>
        </div>

        {/* Pastel collage band — tilted cards, one per course. */}
        <div className="mx-auto max-w-[1180px] px-6 pb-16">
          <motion.div {...enter(0.3)} className="grid gap-6 sm:grid-cols-3">
            {COURSES.map((course, i) => {
              const Icon = courseIcon(course);
              return (
                <div
                  key={course.id}
                  className={cn(
                    "rounded-lg border border-border p-6 shadow-card transition-transform duration-300 hover:rotate-0",
                    COLLAGE_ACCENTS[i % COLLAGE_ACCENTS.length],
                    COLLAGE_TILT[i % COLLAGE_TILT.length],
                  )}
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-card">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <p className="mt-4 font-display text-[20px] leading-tight">{course.name}</p>
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* Marquee ticker of the offer facts — decorative, aria-hidden. */}
        <div className="border-y border-border bg-card py-3" aria-hidden="true">
          <div className="flex w-max animate-marquee gap-10 whitespace-nowrap text-[12px] font-semibold uppercase tracking-[0.2em] text-muted">
            {Array.from({ length: 2 }).map((_, dup) => (
              <span key={dup} className="flex gap-10">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5" /> {COURSES.length} courses
                </span>
                <span>◆</span>
                <span>single course {formatINR(SINGLE_COURSE_OFFER_PRICE)}</span>
                <span>◆</span>
                <span>bundle {formatINR(12500)}</span>
                <span>◆</span>
                <span>
                  <CountUp to={100} suffix="%" /> student focus
                </span>
                <span>◆</span>
                <span>learn. secure. build.</span>
                <span>◆</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      <StatsBand />
      <CoursesSection />
      <WhySection />
      <HowItWorks />
      <PricingSection />
      <AboutSection />
      <FaqSection />
      <CtaBanner />
    </>
  );
}
