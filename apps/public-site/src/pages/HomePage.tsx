import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ShieldCheck, Sparkles, Lock, Code2 } from "lucide-react";
import { COURSES } from "@cyberwolf/shared-types";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/course-card";
import { formatINR, ORIGINAL_PRICE_PER_COURSE, SINGLE_COURSE_OFFER_PRICE } from "@cyberwolf/pricing";

const HIGHLIGHTS = [
  { icon: Lock, title: "Security-first", body: "Learn defensive practices and how modern systems are protected." },
  { icon: Code2, title: "Practical focus", body: "Explore concepts you can apply to real projects and workflows." },
  { icon: Sparkles, title: "Modern topics", body: "Cover cybersecurity, ethical hacking, and AI & web development." },
];

export function HomePage() {
  const reduceMotion = useReducedMotion();
  const fadeUp = reduceMotion
    ? {}
    : { initial: { opacity: 0, y: 12 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.4 } };

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/70">
        <div className="pointer-events-none absolute inset-0 grid-glow" aria-hidden="true" />
        <div className="container relative grid gap-10 py-20 md:py-28 lg:grid-cols-2 lg:items-center">
          <motion.div {...fadeUp}>
            <p className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-3 py-1 text-xs font-medium text-accent">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              CyberWolf 360
            </p>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Learn. Secure. <span className="text-accent text-glow">Build.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-foreground/90">
              Build Your Skills in Cybersecurity, Ethical Hacking and AI.
            </p>
            <p className="mt-4 max-w-xl text-base text-muted">
              Explore technology courses designed to help you develop practical knowledge and strengthen your
              understanding of modern digital technologies.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/courses">
                  Explore Courses
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/pricing">View Pricing</Link>
              </Button>
            </div>
          </motion.div>

          <motion.div {...fadeUp} className="lg:justify-self-end">
            <div className="relative w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-card">
              <div className="absolute -right-3 -top-3 rounded-full border border-secondary/40 bg-background px-3 py-1 text-xs font-medium text-secondary">
                Offer
              </div>
              <p className="text-sm text-muted">Single course offer</p>
              <p className="mt-2 flex items-baseline gap-3">
                <span className="text-3xl font-bold text-accent">{formatINR(SINGLE_COURSE_OFFER_PRICE)}</span>
                <span className="text-sm text-muted line-through">{formatINR(ORIGINAL_PRICE_PER_COURSE)}</span>
              </p>
              <p className="mt-1 text-sm text-secondary">
                Save {formatINR(ORIGINAL_PRICE_PER_COURSE - SINGLE_COURSE_OFFER_PRICE)} per course
              </p>
              <div className="mt-5 space-y-2 border-t border-border/70 pt-4 text-sm">
                {COURSES.map((course) => (
                  <div key={course.id} className="flex items-center justify-between text-muted">
                    <span>{course.name}</span>
                    <span className="text-foreground/80">included</span>
                  </div>
                ))}
              </div>
              <Button asChild className="mt-5 w-full">
                <Link to="/enroll">Enroll Now</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Highlights */}
      <section className="container py-16">
        <div className="grid gap-4 md:grid-cols-3">
          {HIGHLIGHTS.map((item) => (
            <div key={item.title} className="rounded-lg border border-border bg-card p-6">
              <item.icon className="h-5 w-5 text-accent" aria-hidden="true" />
              <h2 className="mt-4 text-base font-semibold">{item.title}</h2>
              <p className="mt-1.5 text-sm text-muted">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Courses */}
      <section className="container pb-20">
        <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">Courses on offer</h2>
          <p className="mt-3 text-muted">
            Choose one or two courses. Descriptions are general guidance, not a verified syllabus.
          </p>
        </motion.div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {COURSES.map((course) => (
            <CourseCard key={course.id} course={course} selected={false} onToggle={() => undefined} selectable={false} />
          ))}
        </div>
        <div className="mt-8 text-center">
          <Button asChild variant="outline">
            <Link to="/courses">See all course details</Link>
          </Button>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/70 bg-background-secondary">
        <div className="container py-16 text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Ready to get started?</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted">
            Submit a registration and our team will follow up using the contact details you provide.
          </p>
          <Button asChild size="lg" className="mt-6">
            <Link to="/enroll">Start your registration</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
