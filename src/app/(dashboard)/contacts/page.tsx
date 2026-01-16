"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CreateContactInput } from "@/app/types/contacts";
import ContactCard from "@/app/components/ContactCard";
import ContactForm from "@/app/components/ContactForm";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import EmptyState from "@/app/components/EmptyState";
import { useAuth } from "@/app/context/AuthContext";
import { useContacts } from "@/app/hooks/queries/contacts/useContacts";
import { useCreateContact } from "@/app/hooks/mutations/contacts/useCreate";
import { useDeleteContact } from "@/app/hooks/mutations/contacts/useDelete";

export default function ContactsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");

  // TanStack Query hooks
  const { data: contacts = [], isLoading } = useContacts();
  const createContactMutation = useCreateContact();
  const deleteContactMutation = useDeleteContact();

  // Client-side auth check
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const handleCreateContact = async (input: CreateContactInput) => {
    setError("");

    try {
      await createContactMutation.mutateAsync(input);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create contact";
      setError(errorMessage);
      throw err;
    }
  };

  const handleDeleteContact = async (id: string) => {
    setError("");

    try {
      await deleteContactMutation.mutateAsync(id);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete contact"
      );
    }
  };

  // Show loading while checking auth
  if (authLoading || (isLoading && contacts.length === 0)) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Contacts
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your contacts and their information
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Add New Contact
            </h2>
            <ContactForm
              onSubmit={handleCreateContact}
              isLoading={createContactMutation.isPending}
            />
          </div>
        </div>

        <div className="lg:col-span-2">
          {contacts.length === 0 ? (
            <EmptyState
              title="No contacts yet"
              description="Add your first contact using the form on the left"
              icon={
                <svg
                  className="w-12 h-12"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              }
            />
          ) : (
            <div className="space-y-4">
              {contacts.map((contact) => (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  onDelete={handleDeleteContact}
                  isDeleting={
                    deleteContactMutation.isPending &&
                    deleteContactMutation.variables === contact.id
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}