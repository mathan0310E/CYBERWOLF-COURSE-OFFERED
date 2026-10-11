import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { COURSES } from "@cyberwolf/shared-types";
import { courseIcon } from "@/components/course-icons";
import { Section } from "@/components/home/section";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { TiltCard } from "@/components/motion/tilt-card";

/** Courses overview — one of the main-page sections (not a separate route). */
export function CoursesSection() {
  return (
    <Section
      id="courses"
      eyebrow="// courses"
      title="Courses on offer"
      description="Explore the courses available on CyberWolf 360. Choose one or two. Descriptions are general marketing copy and are not a verified syllabus."
    >
      <RevealGroup className="grid gap-5 md:grid-cols-3">
        {COURSES.map((course, i) => {
          const Icon = courseIcon(course);
          const accent = i === 0 ? "text-neon" : i === 1 ? "text-violet" : "text-lime";
          const ring = i === 0 ? "glow-neon" : i === 1 ? "glow-violet" : "glow-neon";
          return (
            <RevealItem key={course.id} as="div">
              <TiltCard className="h-full">
                <Link
                  to="/enroll"
                  className="group flex h-full flex-col overflow-hidden rounded-[18px] border border-border bg-card shadow-card transition-all duration-300 hover:border-neon/50 hover:shadow-lift"
                >
                  <div className="grid-bg relative flex h-36 items-center justify-center border-b border-border/70">
                    <span className="absolute inset-0 bg-gradient-to-br from-neon/5 via-transparent to-violet/10" />
                    <span
                      className={`relative flex h-14 w-14 items-center justify-center rounded-[16px] bg-background/80 ${ring} ${accent}`}
                    >
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="font-display text-[21px] font-semibold leading-tight">{course.name}</h3>
                    <p className="mt-2 flex-1 text-[15px] leading-relaxed text-muted">{course.description}</p>
                    <span className="mt-5 inline-flex items-center gap-1.5 font-mono text-[13px] text-neon">
                      select &amp; enroll
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              </TiltCard>
            </RevealItem>
          );
        })}
      </RevealGroup>
    </Section>
  );
}
