import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Contact } from "@/app/types/contacts";

async function deleteContact(id: string): Promise<void> {
  const response = await fetch(`/api/contacts/${id}`, {
    method: "DELETE",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to delete contact");
  }
}

export function useDeleteContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteContact,
    onSuccess: (_, deletedId) => {
      // Remove the contact from the cache
      queryClient.setQueryData<Contact[]>(["contacts"], (old = []) =>
        old.filter((contact) => contact.id !== deletedId)
      );

      // Invalidate related notes queries
      queryClient.invalidateQueries({ queryKey: ["notes", deletedId] });
    },
  });
}