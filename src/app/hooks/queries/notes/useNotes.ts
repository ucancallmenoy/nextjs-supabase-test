import { useQuery } from "@tanstack/react-query";
import { Note } from "@/app/types/notes";

async function fetchNotes(contactId: string): Promise<Note[]> {
  const response = await fetch(`/api/notes?contact_id=${contactId}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch notes");
  }

  return data.notes;
}

export function useNotes(contactId: string) {
  return useQuery({
    queryKey: ["notes", contactId],
    queryFn: () => fetchNotes(contactId),
    enabled: !!contactId,
  });
}