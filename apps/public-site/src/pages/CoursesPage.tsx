import { Link } from "react-router-dom";
import { COURSES } from "@cyberwolf/shared-types";
import { courseIcon } from "@/components/course-icons";
import { Button } from "@/components/ui/button";
import { Seo } from "@/components/seo";

export function CoursesPage() {
  return (
    <div className="container py-16">
      <Seo
        title="Courses"
        description="The three CyberWolf 360 course tracks: Cyber Security, AI & Web Development and Ethical Hacking. General descriptions, not a verified syllabus."
        path="/courses"
      />
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Courses</h1>
        <p className="mt-3 text-muted">
          Explore the courses available on CyberWolf 360. Descriptions are general marketing copy and are not a
          verified syllabus.
        </p>
      </header>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {COURSES.map((course) => {
          const Icon = courseIcon(course);
          return (
            <article key={course.id} className="flex flex-col rounded-lg border border-border bg-card p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-md border border-border bg-background-secondary">
                <Icon className="h-5 w-5 text-accent" aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-lg font-semibold">{course.name}</h2>
              <p className="mt-2 flex-1 text-sm text-muted">{course.description}</p>
            </article>
          );
        })}
      </div>

      <div className="mt-12 text-center">
        <Button asChild size="lg">
          <Link to="/enroll">Select courses and enroll</Link>
        </Button>
      </div>
    </div>
  );
}
