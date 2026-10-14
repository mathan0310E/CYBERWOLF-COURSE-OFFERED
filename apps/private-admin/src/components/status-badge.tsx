import type { EmailJobStatus, RegistrationStatus } from "@cyberwolf/shared-types";
import { Badge } from "@/components/ui/badge";

type Variant = "default" | "secondary" | "accent" | "outline" | "destructive" | "success" | "warning";

const STATUS_VARIANT: Record<RegistrationStatus, Variant> = {
  received: "default",
  "under-review": "secondary",
  contacted: "secondary",
  confirmed: "success",
  declined: "destructive",
  cancelled: "outline",
};

export function StatusBadge({ status }: { status: RegistrationStatus }) {
  return <Badge variant={STATUS_VARIANT[status] ?? "outline"}>{status.replace("-", " ")}</Badge>;
}

const EMAIL_VARIANT: Record<EmailJobStatus, Variant> = {
  queued: "outline",
  processing: "secondary",
  accepted: "default",
  confirmed: "success",
  failed: "destructive",
};

export function EmailStatusBadge({ status }: { status: EmailJobStatus }) {
  return <Badge variant={EMAIL_VARIANT[status] ?? "outline"}>{status}</Badge>;
}
