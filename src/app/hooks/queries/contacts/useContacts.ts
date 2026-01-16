import { useQuery } from "@tanstack/react-query";
import { Contact } from "@/app/types/contacts";

async function fetchContacts(): Promise<Contact[]> {
  const response = await fetch("/api/contacts");
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch contacts");
  }

  return data.contacts;
}

export function useContacts() {
  return useQuery({
    queryKey: ["contacts"],
    queryFn: fetchContacts,
  });
}