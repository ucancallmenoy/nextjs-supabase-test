"use client";

import { Note } from "@/app/types/notes";
import Button from "./Button";

interface NoteCardProps {
  note: Note;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export default function NoteCard({ note, onDelete, isDeleting }: NoteCardProps) {
  const formattedDate = new Date(note.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
            {note.content}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {formattedDate}
          </p>
        </div>
        <Button
          variant="danger"
          onClick={() => onDelete(note.id)}
          isLoading={isDeleting}
          className="text-sm px-3 py-1"
        >
          Delete
        </Button>
      </div>
    </div>
  );
}