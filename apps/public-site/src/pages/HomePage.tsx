import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, BadgeCheck, GraduationCap, MailCheck } from "lucide-react";
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

const TRUST = [
  { icon: GraduationCap, label: "For college students" },
  { icon: BadgeCheck, label: "Choose one or two courses" },
  { icon: MailCheck, label: "Confirmation by email" },
];

const SINGLE_SAVING = ORIGINAL_PRICE_PER_COURSE - SINGLE_COURSE_OFFER_PRICE;

/**
 * The main page. Courses, Pricing, About and FAQ are all rendered here as
 * in-page sections (anchor targets), not as separate routes. Only the
 * registration form lives on its own route (/enroll), because it is a distinct
 * task with its own form state and confirmation flow.
 */
export function HomePage() {
  const reduceMotion = useReducedMotion();
  const fadeUp = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
      };

  return (
    <>
      <Seo
        title="CyberWolf 360 — Cyber Security, AI & Ethical Hacking Courses"
        description="Explore CyberWolf 360 courses in Cyber Security, AI & Web Development and Ethical Hacking. Student registration with transparent pricing."
        path="/"
      />

      {/* Hero — Apple's centred display headline over a light surface. */}
      <section className="relative overflow-hidden bg-background">
        <div className="hero-glow left-1/2 top-[-8rem] -translate-x-1/2" aria-hidden="true" />
        <div className="relative mx-auto max-w-[1024px] px-6 pb-16 pt-16 text-center md:pb-24 md:pt-24">
          <motion.div {...fadeUp} className="mx-auto max-w-3xl">
            <p className="eyebrow">CyberWolf 360</p>
            <h1 className="font-display mt-4 text-[44px] font-semibold leading-[1.05] tracking-[-0.03em] sm:text-[64px] lg:text-[80px]">
              Learn. Secure. Build.
            </h1>
            <p className="font-display mt-5 text-[24px] font-medium leading-snug tracking-tight-apple sm:text-[28px]">
              Build Your Skills in Cybersecurity, Ethical Hacking and AI.
            </p>
            <p className="mx-auto mt-5 max-w-2xl text-[17px] leading-relaxed text-muted sm:text-[21px]">
              Explore technology courses designed to help you develop practical knowledge and strengthen your
              understanding of modern digital technologies.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <a
                href="#courses"
                className="inline-flex items-center gap-2 rounded-pill bg-apple-blue px-6 py-3 text-[17px] text-white transition-colors hover:bg-apple-blue-hover"
              >
                Explore Courses
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href="#pricing"
                className="inline-flex items-center gap-2 rounded-pill text-[17px] text-apple-blue transition-colors hover:underline"
              >
                View Pricing
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>

            <ul className="mt-10 flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
              {TRUST.map((item) => (
                <li key={item.label} className="flex items-center gap-2 text-[14px] text-muted">
                  <item.icon className="h-4 w-4 text-apple-blue" aria-hidden="true" />
                  {item.label}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Offer tile — an Apple-style product card with the price story. */}
          <motion.div {...fadeUp} className="mx-auto mt-14 w-full max-w-[420px]">
            <div className="rounded-[18px] bg-card p-8 text-left shadow-card">
              <p className="eyebrow">Limited-time offer</p>
              <p className="mt-5 text-[14px] text-muted">Single course offer</p>
              <p className="mt-1 flex items-baseline gap-3">
                <span className="font-display text-[40px] font-semibold leading-none tracking-tight-apple">
                  {formatINR(SINGLE_COURSE_OFFER_PRICE)}
                </span>
                <span className="text-[15px] text-muted line-through">{formatINR(ORIGINAL_PRICE_PER_COURSE)}</span>
              </p>
              <p className="mt-2 text-[14px] text-apple-blue">
                Save {formatINR(SINGLE_SAVING)} per course
              </p>

              <ul className="mt-6 space-y-2.5 border-t border-border pt-5">
                {COURSES.map((course) => (
                  <li key={course.id} className="flex items-center justify-between gap-3 text-[15px]">
                    <span className="text-foreground">{course.name}</span>
                    <BadgeCheck className="h-4 w-4 shrink-0 text-apple-blue" aria-hidden="true" />
                  </li>
                ))}
              </ul>

              <Link
                to="/enroll"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-pill bg-apple-blue px-6 py-2.5 text-[15px] text-white transition-colors hover:bg-apple-blue-hover"
              >
                Enroll Now
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats band */}
      <StatsBand />

      {/* Main-page sections */}
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
