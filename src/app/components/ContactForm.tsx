"use client";

import { useState } from "react";
import { CreateContactInput } from "@/app/types/contacts";
import Button from "./Button";
import Input from "./Input";

interface ContactFormProps {
  onSubmit: (data: CreateContactInput) => Promise<void>;
  isLoading?: boolean;
}

export default function ContactForm({ onSubmit, isLoading }: ContactFormProps) {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    try {
      await onSubmit({ name: name.trim(), company: company.trim(), email: email.trim() });
      setName("");
      setCompany("");
      setEmail("");
    } catch {
      setError("Failed to create contact");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Name *"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="John Doe"
        error={error && !name.trim() ? error : undefined}
      />
      <Input
        label="Company"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        placeholder="Acme Inc."
      />
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="john@example.com"
      />
      {error && name.trim() && (
        <p className="text-sm text-red-500">{error}</p>
      )}
      <Button type="submit" isLoading={isLoading} className="w-full">
        Add Contact
      </Button>
    </form>
  );
}