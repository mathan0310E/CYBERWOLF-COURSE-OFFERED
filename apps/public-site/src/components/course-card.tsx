import type { Course, CourseId } from "@cyberwolf/shared-types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { courseIcon } from "@/components/course-icons";
import { cn } from "@/lib/utils";

interface CourseCardProps {
  course: Course;
  selected: boolean;
  onToggle: (id: CourseId) => void;
  /** When false the card is display-only (marketing pages). */
  selectable?: boolean;
  disabled?: boolean;
}

/**
 * A course card. When `selectable` it renders an accessible checkbox whose
 * label is the whole card, so keyboard and touch input both work.
 */
export function CourseCard({ course, selected, onToggle, selectable = true, disabled = false }: CourseCardProps) {
  const Icon = courseIcon(course);
  const inputId = `course-${course.id}`;

  return (
    <Card
      className={cn(
        "group relative h-full transition-colors",
        selectable && "hover:border-accent/40",
        selected && "border-accent/60 bg-accent/[0.04]",
      )}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <span
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-md border",
              selected ? "border-accent/50 bg-accent/10" : "border-border bg-background-secondary",
            )}
          >
            <Icon className={cn("h-5 w-5", selected ? "text-accent" : "text-muted")} aria-hidden="true" />
          </span>
          {selected && <Badge>Selected</Badge>}
        </div>
        <CardTitle className="mt-4">{course.name}</CardTitle>
        <CardDescription>{course.description}</CardDescription>
      </CardHeader>
      {selectable && (
        <CardContent>
          <div className="flex items-center gap-2.5">
            <Checkbox
              id={inputId}
              checked={selected}
              disabled={disabled}
              onCheckedChange={() => onToggle(course.id)}
              aria-describedby={`${inputId}-hint`}
            />
            <label htmlFor={inputId} className="cursor-pointer text-sm text-muted select-none">
              {selected ? "Selected" : "Select this course"}
            </label>
          </div>
          <p id={`${inputId}-hint`} className="sr-only">
            Toggle selection of {course.name}.
          </p>
        </CardContent>
      )}
    </Card>
  );
}
