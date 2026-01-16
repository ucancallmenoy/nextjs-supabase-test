import { createClient } from "@/app/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET notes for a contact
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const contactId = searchParams.get("contact_id");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!contactId) {
      return NextResponse.json(
        { error: "contact_id is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("contact_id", contactId)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ notes: data }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST create a new note
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { contact_id, content } = await request.json();

    if (!contact_id) {
      return NextResponse.json(
        { error: "contact_id is required" },
        { status: 400 }
      );
    }

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    // Verify the contact belongs to the user
    const { data: contact, error: contactError } = await supabase
      .from("contacts")
      .select("id")
      .eq("id", contact_id)
      .eq("user_id", user.id)
      .single();

    if (contactError || !contact) {
      return NextResponse.json(
        { error: "Contact not found or unauthorized" },
        { status: 404 }
      );
    }

    const { data, error } = await supabase
      .from("notes")
      .insert({
        user_id: user.id,
        contact_id,
        content: content.trim(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ note: data }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}