import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ShieldCheck, GraduationCap, MailCheck, BadgeCheck } from "lucide-react";
import { COURSES } from "@cyberwolf/shared-types";
import { Button } from "@/components/ui/button";
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
        initial: { opacity: 0, y: 18 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
      };

  return (
    <>
      <Seo
        title="CyberWolf 360 — Cyber Security, AI & Ethical Hacking Courses"
        description="Explore CyberWolf 360 courses in Cyber Security, AI & Web Development and Ethical Hacking. Student registration with transparent pricing."
        path="/"
      />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="hero-glow -right-32 -top-40" aria-hidden="true" />
        <span className="blob left-[6%] top-[16%] h-16 w-16 bg-brand-amber-light" aria-hidden="true" />
        <span
          className="blob bottom-[18%] left-[12%] h-9 w-9 bg-brand-green-light"
          aria-hidden="true"
          style={{ animationDelay: "1.5s" }}
        />
        <span className="blob right-[8%] top-[58%] h-6 w-6 bg-red-100" aria-hidden="true" style={{ animationDelay: "0.7s" }} />

        <div className="container relative grid gap-14 py-20 md:py-28 lg:grid-cols-2 lg:items-center">
          <motion.div {...fadeUp}>
            <p className="eyebrow">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              CyberWolf 360
            </p>
            <h1 className="font-display mt-6 text-[2.6rem] font-extrabold leading-[1.06] tracking-tight sm:text-5xl lg:text-6xl">
              Learn. Secure.{" "}
              <span className="accent-underline">
                Build.
                <svg viewBox="0 0 200 14" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M2 10 C 50 2, 150 2, 198 8" fill="none" stroke="#16A34A" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </span>
            </h1>
            <p className="font-display mt-6 max-w-xl text-xl font-semibold text-foreground">
              Build Your Skills in Cybersecurity, Ethical Hacking and AI.
            </p>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">
              Explore technology courses designed to help you develop practical knowledge and strengthen your
              understanding of modern digital technologies.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <a href="#courses">
                  Explore Courses
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#pricing">View Pricing</a>
              </Button>
            </div>

            <ul className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
              {TRUST.map((item) => (
                <li key={item.label} className="flex items-center gap-2 text-sm font-medium text-muted">
                  <item.icon className="h-4 w-4 text-brand-green" aria-hidden="true" />
                  {item.label}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Hero media: a framed offer card with floating accents. */}
          <motion.div {...fadeUp} className="relative lg:justify-self-end">
            <div className="relative mx-auto w-full max-w-md">
              <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-brand-green-dark via-brand-green to-[#22C55E] p-8 shadow-lift">
                <div
                  className="absolute inset-0 opacity-20"
                  aria-hidden="true"
                  style={{
                    backgroundImage:
                      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Ccircle cx='2' cy='2' r='1.4' fill='white' fill-opacity='0.35'/%3E%3C/svg%3E\")",
                  }}
                />
                <div className="relative">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white ring-1 ring-inset ring-white/25">
                    Limited-time offer
                  </span>
                  <p className="font-display mt-6 text-sm font-medium text-white/80">Single course offer</p>
                  <p className="mt-1 flex items-baseline gap-3">
                    <span className="font-display text-4xl font-extrabold text-white">
                      {formatINR(SINGLE_COURSE_OFFER_PRICE)}
                    </span>
                    <span className="text-sm text-white/70 line-through">{formatINR(ORIGINAL_PRICE_PER_COURSE)}</span>
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    Save {formatINR(ORIGINAL_PRICE_PER_COURSE - SINGLE_COURSE_OFFER_PRICE)} per course
                  </p>

                  <div className="mt-6 rounded-2xl bg-white p-5 shadow-soft">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">Courses included</p>
                    <ul className="mt-3 space-y-2 text-sm">
                      {COURSES.map((course) => (
                        <li key={course.id} className="flex items-center justify-between gap-3">
                          <span className="text-foreground">{course.name}</span>
                          <BadgeCheck className="h-4 w-4 shrink-0 text-brand-green" aria-hidden="true" />
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button asChild className="mt-5 w-full">
                    <Link to="/enroll">
                      Enroll Now
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="absolute -left-5 top-10 hidden rounded-2xl border border-border bg-card px-4 py-3 shadow-soft sm:block">
                <p className="font-display text-lg font-extrabold text-brand-green">2</p>
                <p className="text-xs text-muted">max courses</p>
              </div>
              <div className="absolute -right-4 bottom-12 hidden rounded-2xl border border-border bg-card px-4 py-3 shadow-soft sm:block">
                <p className="font-display text-lg font-extrabold text-brand-amber">₹12,500</p>
                <p className="text-xs text-muted">two-course bundle</p>
              </div>
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
