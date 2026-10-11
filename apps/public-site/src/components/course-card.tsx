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
        "group relative h-full overflow-hidden transition-all duration-300",
        selectable && "hover:-translate-y-1 hover:shadow-lift",
        selected && "border-2 border-brand-green shadow-lift",
      )}
    >
      <div className="relative h-28 bg-gradient-to-br from-brand-green-dark via-brand-green to-[#22C55E]">
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
        {selected && (
          <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-green-dark shadow-soft">
            <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
            Selected
          </span>
        )}
      </div>

      <div className="p-6 pt-10">
        <h3 className="font-display text-lg font-bold">{course.name}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">{course.description}</p>

        {selectable && (
          <div className="mt-5 flex items-center gap-2.5">
            <Checkbox
              id={inputId}
              checked={selected}
              disabled={disabled}
              onCheckedChange={() => onToggle(course.id)}
              aria-describedby={`${inputId}-hint`}
            />
            <label htmlFor={inputId} className="cursor-pointer select-none text-sm font-medium text-foreground">
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
