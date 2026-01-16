import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Contact, CreateContactInput } from "@/app/types/contacts";

async function createContact(input: CreateContactInput): Promise<Contact> {
  const response = await fetch("/api/contacts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to create contact");
  }

  return data.contact;
}

export function useCreateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createContact,
    onSuccess: (newContact) => {
      // Update the contacts list in the cache
      queryClient.setQueryData<Contact[]>(["contacts"], (old = []) => [
        newContact,
        ...old,
      ]);
    },
  });
}