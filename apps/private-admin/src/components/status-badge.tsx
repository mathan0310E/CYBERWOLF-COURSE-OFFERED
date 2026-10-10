import type { EmailJobStatus, RegistrationStatus } from "@cyberwolf/shared-types";
import { Badge } from "@/components/ui/badge";

const STATUS_VARIANT: Record<RegistrationStatus, "default" | "secondary" | "outline" | "destructive"> = {
  received: "default",
  "under-review": "secondary",
  contacted: "secondary",
  confirmed: "default",
  declined: "destructive",
  cancelled: "outline",
};

export function StatusBadge({ status }: { status: RegistrationStatus }) {
  return <Badge variant={STATUS_VARIANT[status] ?? "outline"}>{status.replace("-", " ")}</Badge>;
}

const EMAIL_VARIANT: Record<EmailJobStatus, "default" | "secondary" | "outline" | "destructive"> = {
  queued: "outline",
  processing: "secondary",
  accepted: "default",
  confirmed: "default",
  failed: "destructive",
};

export function EmailStatusBadge({ status }: { status: EmailJobStatus }) {
  return <Badge variant={EMAIL_VARIANT[status] ?? "outline"}>{status}</Badge>;
}
