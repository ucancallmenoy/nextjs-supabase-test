"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Contact } from "@/app/types/contacts";
import { createClient } from "@/app/lib/supabase/client";
import NoteCard from "@/app/components/NoteCard";
import NoteForm from "@/app/components/NoteForm";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import EmptyState from "@/app/components/EmptyState";
import Button from "@/app/components/Button";
import { useAuth } from "@/app/context/AuthContext";
import { useNotes } from "@/app/hooks/queries/notes/useNotes";
import { useCreateNote } from "@/app/hooks/mutations/notes/useCreate";
import { useDeleteNote } from "@/app/hooks/mutations/notes/useDelete";

async function fetchContact(contactId: string): Promise<Contact> {
  const response = await fetch(`/api/contacts/${contactId}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch contact");
  }

  return data.contact;
}

export default function ContactDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const contactId = params.id as string;
  const [mutationError, setMutationError] = useState("");
  const queryClient = useQueryClient();

  const supabase = createClient();

  // TanStack Query hooks
  const {
    data: contact,
    isLoading: contactLoading,
    error: contactError,
  } = useQuery({
    queryKey: ["contact", contactId],
    queryFn: () => fetchContact(contactId),
    enabled: !!user && !!contactId,
  });

  const { data: notes = [], isLoading: notesLoading } = useNotes(contactId);
  const createNoteMutation = useCreateNote();
  const deleteNoteMutation = useDeleteNote(contactId);

  // Client-side auth check
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Real-time subscription for notes
  useEffect(() => {
    if (!user || !contactId) return;

    const channel = supabase
      .channel(`notes:contact_id=eq.${contactId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notes",
          filter: `contact_id=eq.${contactId}`,
        },
        () => {
          // Invalidate notes query to refetch
          queryClient.invalidateQueries({ queryKey: ["notes", contactId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [contactId, supabase, user, queryClient]);

  const handleAddNote = async (content: string) => {
    setMutationError("");

    try {
      await createNoteMutation.mutateAsync({
        contact_id: contactId,
        content,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to add note";
      setMutationError(errorMessage);
      throw err;
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    setMutationError("");

    try {
      await deleteNoteMutation.mutateAsync(noteId);
    } catch (err) {
      setMutationError(
        err instanceof Error ? err.message : "Failed to delete note"
      );
    }
  };

  // Show loading while checking auth
  if (authLoading || (contactLoading && !contact)) {
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

  // Display contact fetch error
  if (contactError) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg max-w-md mx-auto">
          {contactError instanceof Error
            ? contactError.message
            : "Failed to load contact"}
        </div>
        <Link
          href="/contacts"
          className="text-blue-600 hover:underline inline-block"
        >
          Back to contacts
        </Link>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Contact not found
        </h2>
        <Link
          href="/contacts"
          className="text-blue-600 hover:underline mt-4 inline-block"
        >
          Back to contacts
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="secondary" onClick={() => router.push("/contacts")}>
          ← Back
        </Button>
      </div>

      {mutationError && (
        <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
          {mutationError}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {contact.name}
        </h1>
        {contact.company && (
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
            {contact.company}
          </p>
        )}
        {contact.email && (
          <p className="text-gray-500 dark:text-gray-500 mt-1">
            <a
              href={`mailto:${contact.email}`}
              className="hover:text-blue-600 dark:hover:text-blue-400"
            >
              {contact.email}
            </a>
          </p>
        )}
        <p className="text-sm text-gray-400 mt-4">
          Added on {new Date(contact.created_at).toLocaleDateString()}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Add Note
            </h2>
            <NoteForm
              onSubmit={handleAddNote}
              isLoading={createNoteMutation.isPending}
            />
          </div>
        </div>

        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Notes ({notes.length})
          </h2>

          {notesLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : notes.length === 0 ? (
            <EmptyState
              title="No notes yet"
              description="Add your first note for this contact"
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
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              }
            />
          ) : (
            <div className="space-y-4">
              {notes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onDelete={handleDeleteNote}
                  isDeleting={
                    deleteNoteMutation.isPending &&
                    deleteNoteMutation.variables === note.id
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