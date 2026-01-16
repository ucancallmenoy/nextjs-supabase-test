import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Note } from "@/app/types/notes";

interface CreateNoteInput {
  contact_id: string;
  content: string;
}

async function createNote(input: CreateNoteInput): Promise<Note> {
  const response = await fetch("/api/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to create note");
  }

  return data.note;
}

export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createNote,
    onSuccess: (newNote) => {
      // Update the notes list in the cache
      queryClient.setQueryData<Note[]>(
        ["notes", newNote.contact_id],
        (old = []) => [newNote, ...old]
      );
    },
  });
}