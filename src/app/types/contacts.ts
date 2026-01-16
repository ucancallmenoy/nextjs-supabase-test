export interface Contact {
  id: string;
  user_id: string;
  name: string;
  company?: string | null;
  email?: string | null;
  created_at: string;
}

export interface CreateContactInput {
  name: string;
  company?: string;
  email?: string;
}

export interface UpdateContactInput {
  name?: string;
  company?: string;
  email?: string;
}