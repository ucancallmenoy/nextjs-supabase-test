"use client";

import Link from "next/link";
import { Contact } from "@/app/types/contacts";
import Button from "./Button";

interface ContactCardProps {
  contact: Contact;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export default function ContactCard({ contact, onDelete, isDeleting }: ContactCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <Link href={`/contacts/${contact.id}`} className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
            {contact.name}
          </h3>
          {contact.company && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {contact.company}
            </p>
          )}
          {contact.email && (
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              {contact.email}
            </p>
          )}
        </Link>
        <Button
          variant="danger"
          onClick={() => onDelete(contact.id)}
          isLoading={isDeleting}
          className="ml-4 text-sm px-3 py-1"
        >
          Delete
        </Button>
      </div>
    </div>
  );
}