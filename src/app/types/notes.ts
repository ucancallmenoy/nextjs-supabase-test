export interface Note {
  id: string;
  user_id: string;
  contact_id: string;
  content: string;
  created_at: string;
}

export interface CreateNoteInput {
  contact_id: string;
  content: string;
}