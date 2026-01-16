"use client";

import { useState } from "react";
import Button from "./Button";

interface NoteFormProps {
  onSubmit: (content: string) => Promise<void>;
  isLoading?: boolean;
}

export default function NoteForm({ onSubmit, isLoading }: NoteFormProps) {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!content.trim()) {
      setError("Note content is required");
      return;
    }

    try {
      await onSubmit(content.trim());
      setContent("");
    } catch {
      setError("Failed to add note");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Add a note *
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter your note here..."
          rows={3}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white border-gray-300 resize-none"
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
      <Button type="submit" isLoading={isLoading}>
        Add Note
      </Button>
    </form>
  );
}