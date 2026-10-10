import { Bot, ShieldCheck, Terminal, type LucideIcon } from "lucide-react";
import type { Course } from "@cyberwolf/shared-types";

const ICONS: Record<string, LucideIcon> = {
  ShieldCheck,
  Bot,
  Terminal,
};

/** Resolve a Lucide icon by the name stored in the course definition. */
export function courseIcon(course: Course): LucideIcon {
  return ICONS[course.icon] ?? ShieldCheck;
}
