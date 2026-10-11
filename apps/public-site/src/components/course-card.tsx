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
        "group relative flex h-full flex-col overflow-hidden border-0 shadow-card transition-all duration-300",
        selectable && "hover:shadow-lift",
        selected && "ring-2 ring-neon",
      )}
    >
      <div className="relative flex h-32 items-center justify-center bg-background-secondary">
        <span className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-card text-neon shadow-card">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
        {selected && (
          <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-pill bg-neon px-3 py-1 text-xs font-semibold text-[#04121A]">
            <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
            Selected
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-[21px] font-semibold leading-tight">{course.name}</h3>
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
            <label htmlFor={inputId} className="cursor-pointer select-none text-[15px] text-foreground">
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
