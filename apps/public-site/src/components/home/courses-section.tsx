import { Link } from "react-router-dom";
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
            <article key={course.id} className="flex flex-col rounded-lg border border-border bg-card p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background-secondary">
                <Icon className="h-5 w-5 text-accent" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">{course.name}</h3>
              <p className="mt-2 flex-1 text-sm text-muted">{course.description}</p>
            </article>
          );
        })}
      </div>

      <div className="mt-10 text-center">
        <Button asChild size="lg">
          <Link to="/enroll">Select courses and enroll</Link>
        </Button>
      </div>
    </Section>
  );
}
