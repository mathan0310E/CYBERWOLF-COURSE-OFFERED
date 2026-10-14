import type { Course, CourseId } from "@cyberwolf/shared-types";
import { Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { courseIcon } from "@/components/course-icons";
import { cn } from "@/lib/utils";

interface CourseCardProps {
  course: Course;
  selected: boolean;
  onToggle: (id: CourseId) => void;
  /** When false the card is display-only (marketing pages). */
  selectable?: boolean;
  disabled?: boolean;
  /** Pastel tint for the card's header band. */
  accent?: string;
}

/**
 * A course card. When `selectable` it renders an accessible checkbox whose
 * label is the whole card, so keyboard and touch input both work.
 */
export function CourseCard({
  course,
  selected,
  onToggle,
  selectable = true,
  disabled = false,
  accent = "bg-sky",
}: CourseCardProps) {
  const Icon = courseIcon(course);
  const inputId = `course-${course.id}`;

  return (
    <Card
      className={cn(
        "group relative flex h-full flex-col overflow-hidden transition-all duration-200",
        selectable && "hover:-translate-y-1 hover:shadow-lift",
        selected ? "shadow-lift ring-2 ring-ring" : "shadow-card",
      )}
    >
      <div className={cn("relative flex h-28 items-center justify-center border-b border-border", accent)}>
        <span className="flex h-14 w-14 items-center justify-center rounded-lg border border-border bg-card">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
        {selected && (
          <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-pill border border-border bg-ink px-3 py-1 text-xs font-semibold text-[#F5F2EB]">
            <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
            Selected
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-[21px] leading-tight">{course.name}</h3>
        <p className="mt-2 flex-1 text-[15px] leading-relaxed text-muted">{course.description}</p>

        {selectable && (
          <div className="mt-5 flex items-center gap-2.5">
            <Checkbox
              id={inputId}
              checked={selected}
              disabled={disabled}
              onCheckedChange={() => onToggle(course.id)}
              aria-describedby={`${inputId}-hint`}
            />
            <label htmlFor={inputId} className="cursor-pointer select-none text-[15px] font-medium">
              {selected ? "Selected" : "Select this course"}
            </label>
          </div>
        )}
        {selectable && (
          <p id={`${inputId}-hint`} className="sr-only">
            Toggle selection of {course.name}.
          </p>
        )}
      </div>
    </Card>
  );
}
