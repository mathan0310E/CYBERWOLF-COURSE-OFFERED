import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { COURSES } from "@cyberwolf/shared-types";
import { courseIcon } from "@/components/course-icons";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/home/section";

/** Courses overview — one of the main-page sections (not a separate route). */
export function CoursesSection() {
  return (
    <Section
      id="courses"
      eyebrow="Courses"
      title="Courses on offer"
      description="Explore the courses available on CyberWolf 360. Choose one or two. Descriptions are general marketing copy and are not a verified syllabus."
    >
      <div className="grid gap-6 md:grid-cols-3">
        {COURSES.map((course) => {
          const Icon = courseIcon(course);
          return (
            <article
              key={course.id}
              className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lift"
            >
              <div className="relative h-36 bg-gradient-to-br from-brand-green-dark via-brand-green to-[#22C55E]">
                <div
                  className="absolute inset-0 opacity-20"
                  aria-hidden="true"
                  style={{
                    backgroundImage:
                      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Ccircle cx='2' cy='2' r='1.4' fill='white' fill-opacity='0.35'/%3E%3C/svg%3E\")",
                  }}
                />
                <span className="absolute -bottom-6 left-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-card text-brand-green shadow-soft">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
              </div>
              <div className="flex flex-1 flex-col p-6 pt-10">
                <h3 className="font-display text-lg font-bold">{course.name}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{course.description}</p>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-12 text-center">
        <Button asChild size="lg">
          <Link to="/enroll">
            Select courses and enroll
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </Section>
  );
}
