export interface Client {
  id: string;
  created_at: string;
  contact_id: string | null;
  auth_user_id: string | null;
  name: string;
  company: string | null;
  email: string;
  status: string; // active | paused | offboarded
  locale: string; // en | es
}

export interface Project {
  id: string;
  created_at: string;
  client_id: string;
  name: string;
  status: string; // active | paused | completed
}

export const CLIENT_STATUSES = ["active", "paused", "offboarded"];
export const PROJECT_STATUSES = ["active", "paused", "completed"];
