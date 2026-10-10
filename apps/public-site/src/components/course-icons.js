import { Bot, ShieldCheck, Terminal } from "lucide-react";
const ICONS = {
    ShieldCheck,
    Bot,
    Terminal,
};
/** Resolve a Lucide icon by the name stored in the course definition. */
export function courseIcon(course) {
    return ICONS[course.icon] ?? ShieldCheck;
}
