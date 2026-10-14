import { Link } from "react-router-dom";
import { COURSES } from "@cyberwolf/shared-types";
import { courseIcon } from "@/components/course-icons";
import { Section } from "@/components/home/section";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

const ACCENTS = ["bg-sky", "bg-butter", "bg-lilac"];

/** Courses overview — one of the main-page sections (not a separate route). */
export function CoursesSection() {
  return (
    <Section
      id="courses"
      eyebrow="Courses"
      title="Courses on offer"
      description="Explore the courses available on CyberWolf 360. Choose one or two. Descriptions are general marketing copy and are not a verified syllabus."
    >
      <RevealGroup className="grid gap-6 md:grid-cols-3">
        {COURSES.map((course, i) => {
          const Icon = courseIcon(course);
          const accent = ACCENTS[i % ACCENTS.length];
          return (
            <RevealItem key={course.id} as="div">
              <Link
                to="/enroll"
                className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card shadow-card transition-all duration-200 hover:-translate-y-1.5 hover:shadow-lift"
              >
                <div className={cn("flex h-32 items-center justify-center border-b border-border", accent)}>
                  <span className="flex h-16 w-16 items-center justify-center rounded-lg border border-border bg-card">
                    <Icon className="h-7 w-7" aria-hidden="true" />
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-[23px] leading-tight">{course.name}</h3>
                  <p className="mt-2 flex-1 text-[15px] leading-relaxed text-muted">{course.description}</p>
                  <span className="mt-5 text-[14px] font-semibold underline underline-offset-4">
                    Select &amp; enroll
                  </span>
                </div>
              </Link>
            </RevealItem>
          );
        })}
      </RevealGroup>
    </Section>
  );
}
