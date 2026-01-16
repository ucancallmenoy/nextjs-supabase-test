import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Note } from "@/app/types/notes";

async function deleteNote(id: string): Promise<void> {
  const response = await fetch(`/api/notes/${id}`, {
    method: "DELETE",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to delete note");
  }
}

export function useDeleteNote(contactId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNote,
    onSuccess: (_, deletedId) => {
      // Remove the note from the cache
      queryClient.setQueryData<Note[]>(["notes", contactId], (old = []) =>
        old.filter((note) => note.id !== deletedId)
      );
    },
  });
}