import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { COURSES } from "@cyberwolf/shared-types";
import { courseIcon } from "@/components/course-icons";
import { Section } from "@/components/home/section";
import { cn } from "@/lib/utils";

/** Courses overview — one of the main-page sections (not a separate route). */
export function CoursesSection() {
  return (
    <Section
      id="courses"
      eyebrow="Courses"
      title="Courses on offer"
      description="Explore the courses available on CyberWolf 360. Choose one or two. Descriptions are general marketing copy and are not a verified syllabus."
    >
      <div className="grid gap-5 md:grid-cols-3">
        {COURSES.map((course) => {
          const Icon = courseIcon(course);
          return (
            <Link
              key={course.id}
              to="/enroll"
              className="group flex h-full flex-col overflow-hidden rounded-[18px] bg-card shadow-card transition-shadow duration-300 hover:shadow-lift"
            >
              <div className="flex h-32 items-center justify-center bg-background-secondary">
                <span className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-card text-apple-blue shadow-card">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-display text-[21px] font-semibold leading-tight">{course.name}</h3>
                <p className="mt-2 flex-1 text-[15px] leading-relaxed text-muted">{course.description}</p>
                <span
                  className={cn(
                    "mt-4 inline-flex items-center gap-1 text-[14px] text-apple-blue",
                    "opacity-0 transition-opacity duration-300 group-hover:opacity-100",
                  )}
                >
                  Select courses and enroll
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </Section>
  );
}
