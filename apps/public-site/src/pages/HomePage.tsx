import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, BadgeCheck, GraduationCap, MailCheck, ShieldCheck } from "lucide-react";
import { COURSES } from "@cyberwolf/shared-types";
import { Seo } from "@/components/seo";
import { formatINR, ORIGINAL_PRICE_PER_COURSE, SINGLE_COURSE_OFFER_PRICE } from "@cyberwolf/pricing";
import { StatsBand } from "@/components/home/stats-band";
import { CoursesSection } from "@/components/home/courses-section";
import { WhySection } from "@/components/home/why-section";
import { HowItWorks } from "@/components/home/how-it-works";
import { PricingSection } from "@/components/home/pricing-section";
import { AboutSection } from "@/components/home/about-section";
import { FaqSection } from "@/components/home/faq-section";
import { CtaBanner } from "@/components/home/cta-banner";
import { Terminal } from "@/components/fx/terminal";
import { CountUp } from "@/components/motion/count-up";

const TRUST = [
  { icon: GraduationCap, label: "For college students" },
  { icon: BadgeCheck, label: "Choose one or two courses" },
  { icon: MailCheck, label: "Confirmation by email" },
];

const SINGLE_SAVING = ORIGINAL_PRICE_PER_COURSE - SINGLE_COURSE_OFFER_PRICE;

const TERMINAL_LINES = [
  { text: "nmap -sV skills.local", prompt: true },
  { text: "→ 3 courses discovered" },
  { text: "python build_future.py", prompt: true },
  { text: "→ learn. secure. build. ✔" },
];

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
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <>
      <Seo
        title="CyberWolf 360 — Cyber Security, AI & Ethical Hacking Courses"
        description="Explore CyberWolf 360 courses in Cyber Security, AI & Web Development and Ethical Hacking. Student registration with transparent pricing."
        path="/"
      />

      {/* Hero — dark cyber surface, animated aurora + grid, typed terminal. */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="grid-bg grid-drift absolute inset-0 opacity-[0.35]" aria-hidden="true" />
        <div className="aurora -left-24 -top-24 h-[26rem] w-[26rem] bg-neon/25" aria-hidden="true" />
        <div
          className="aurora -right-24 top-10 h-[24rem] w-[24rem] bg-violet/25"
          style={{ animationDelay: "2s" }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neon/70 to-transparent"
          aria-hidden="true"
        />

        <div className="relative mx-auto grid max-w-[1180px] items-center gap-14 px-6 pb-20 pt-16 md:pt-24 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <motion.p {...enter(0)} className="eyebrow">
              // learn. secure. build.
            </motion.p>
            <motion.h1
              {...enter(0.05)}
              className="font-display mt-5 text-[46px] font-semibold leading-[1.02] tracking-[-0.03em] sm:text-[64px] lg:text-[76px]"
            >
              Learn. <span className="text-gradient">Secure.</span> Build.
            </motion.h1>
            <motion.p
              {...enter(0.1)}
              className="font-display mt-6 text-[22px] font-medium leading-snug tracking-tight sm:text-[26px]"
            >
              Build Your Skills in Cybersecurity, Ethical Hacking and AI.
            </motion.p>
            <motion.p {...enter(0.15)} className="mt-5 max-w-xl text-[17px] leading-relaxed text-muted">
              Explore technology courses designed to help you develop practical knowledge and strengthen your
              understanding of modern digital technologies.
            </motion.p>

            <motion.div {...enter(0.2)} className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#courses"
                className="glow-neon inline-flex items-center gap-2 rounded-pill bg-neon px-6 py-3 text-[16px] font-medium text-[#04121A] transition-transform hover:scale-[1.03]"
              >
                Explore Courses
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href="#pricing"
                className="inline-flex items-center gap-2 rounded-pill border border-border px-6 py-3 text-[16px] text-foreground transition-colors hover:border-neon/60 hover:text-neon"
              >
                View Pricing
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </motion.div>

            <motion.ul {...enter(0.25)} className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-3">
              {TRUST.map((item) => (
                <li key={item.label} className="flex items-center gap-2 text-[14px] text-muted">
                  <item.icon className="h-4 w-4 text-neon" aria-hidden="true" />
                  {item.label}
                </li>
              ))}
            </motion.ul>
          </div>

          {/* Terminal + offer card. */}
          <motion.div {...enter(0.3)} className="space-y-5">
            <Terminal lines={TERMINAL_LINES} />

            <div className="glass edge-glow rounded-[18px] p-7 shadow-card">
              <p className="eyebrow">// offer</p>
              <p className="mt-4 text-[13px] text-muted">Single course offer</p>
              <p className="mt-1 flex items-baseline gap-3">
                <span className="font-display text-[40px] font-semibold leading-none tracking-tight text-gradient">
                  {formatINR(SINGLE_COURSE_OFFER_PRICE)}
                </span>
                <span className="text-[15px] text-muted line-through">{formatINR(ORIGINAL_PRICE_PER_COURSE)}</span>
              </p>
              <p className="mt-2 font-mono text-[13px] text-lime">
                save {formatINR(SINGLE_SAVING)} per course
              </p>

              <ul className="mt-5 space-y-2.5 border-t border-border pt-5">
                {COURSES.map((course) => (
                  <li key={course.id} className="flex items-center justify-between gap-3 text-[15px]">
                    <span className="text-foreground">{course.name}</span>
                    <BadgeCheck className="h-4 w-4 shrink-0 text-neon" aria-hidden="true" />
                  </li>
                ))}
              </ul>

              <Link
                to="/enroll"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-pill bg-neon px-6 py-2.5 text-[15px] font-medium text-[#04121A] transition-colors hover:bg-neon/90"
              >
                Enroll Now
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Marquee ticker of the offer facts — decorative, aria-hidden. */}
        <div className="relative border-t border-border/70 py-3" aria-hidden="true">
          <div className="flex w-max animate-marquee gap-10 whitespace-nowrap font-mono text-[12px] uppercase tracking-[0.2em] text-muted">
            {Array.from({ length: 2 }).map((_, dup) => (
              <span key={dup} className="flex gap-10">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-neon" /> {COURSES.length} courses
                </span>
                <span className="text-neon">◆</span>
                <span className="flex items-center gap-2">
                  single course {formatINR(SINGLE_COURSE_OFFER_PRICE)}
                </span>
                <span className="text-violet">◆</span>
                <span className="flex items-center gap-2">bundle from {formatINR(12500)}</span>
                <span className="text-neon">◆</span>
                <span className="flex items-center gap-2">
                  <CountUp to={100} suffix="%" /> student focus
                </span>
                <span className="text-violet">◆</span>
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
