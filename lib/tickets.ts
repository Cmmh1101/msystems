export interface Ticket {
  id: string;
  created_at: string;
  updated_at: string;
  project_id: string;
  title: string;
  description: string | null;
  column_status: string;
  created_by_role: string;
  created_by_client_id: string | null;
  billing_status: string;
  stripe_payment_link: string | null;
  is_milestone: boolean;
  published_at: string | null;
}

export const COLUMN_STATUSES = ["client_request", "needs_review", "to_do", "in_progress", "done"] as const;

export const COLUMN_LABELS: Record<string, string> = {
  client_request: "Client Request",
  needs_review: "Needs Review",
  to_do: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

export const BILLING_STATUSES = ["n/a", "needs_quote", "quoted", "paid"] as const;
