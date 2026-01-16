# Mini Contacts + Notes

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier available at [supabase.com](https://supabase.com))

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd nextjs-supabase-test
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

You can find these values in your Supabase project settings under **Settings > API keys**.

4. **Set up Supabase database**

Run these SQL commands in your Supabase SQL editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create contacts table
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  company TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create notes table
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contacts
CREATE POLICY "Users can view own contacts" ON contacts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own contacts" ON contacts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contacts" ON contacts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own contacts" ON contacts
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for notes
CREATE POLICY "Users can view own notes" ON notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create notes for own contacts" ON notes
  FOR INSERT WITH CHECK (
    auth.uid() = user_id 
    AND EXISTS (
      SELECT 1 FROM contacts 
      WHERE contacts.id = contact_id 
      AND contacts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own notes" ON notes
  FOR DELETE USING (auth.uid() = user_id);

-- Enable realtime for notes table
ALTER PUBLICATION supabase_realtime ADD TABLE notes;

-- Create indexes for better performance
CREATE INDEX idx_contacts_user_id ON contacts(user_id);
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_contact_id ON notes(contact_id);
```

5. **Run the development server**
```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Folder Structure
```
mini-contacts-notes/
├── src/
│   ├── app/                          # Next.js 13+ App Router
│   │   ├── (auth)/                   # Authentication routes
│   │   │   └── login/
│   │   │       └── page.tsx          # Login & signup page
│   │   │
│   │   ├── (dashboard)/              # Protected dashboard routes
│   │   │   ├── contacts/
│   │   │   │   ├── page.tsx          # Contacts list page
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx      # Contact detail page with notes
│   │   │
│   │   ├── api/                      # API routes
│   │   │   ├── contacts/
│   │   │   │   ├── route.ts          # GET/POST contacts
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts      # GET/DELETE specific contact
│   │   │   └── notes/
│   │   │       ├── route.ts          # GET/POST notes
│   │   │       └── [id]/
│   │   │           └── route.ts      # GET/DELETE specific note
│   │   │
│   │   ├── components/               # Reusable React components
│   │   │   ├── Button.tsx            # Button component
│   │   │   ├── ContactCard.tsx       # Contact card display
│   │   │   ├── ContactForm.tsx       # Create/edit contact form
│   │   │   ├── EmptyState.tsx        # Empty state UI
│   │   │   ├── Footer.tsx            # Application footer
│   │   │   ├── Header.tsx            # Navigation header
│   │   │   ├── Input.tsx             # Form input component
│   │   │   ├── LoadingSpinner.tsx    # Loading indicator
│   │   │   ├── NoteCard.tsx          # Note card display
│   │   │   └── NoteForm.tsx          # Create note form
│   │   │
│   │   ├── context/                  # React Context providers
│   │   │   └── AuthContext.tsx       # Authentication state management
│   │   │
│   │   ├── hooks/                    # Custom React hooks
│   │   │   ├── queries/              # TanStack Query data fetching
│   │   │   │   ├── contacts/
│   │   │   │   │   └── useContacts.ts    # Fetch all contacts
│   │   │   │   └── notes/
│   │   │   │       └── useNotes.ts      # Fetch notes for a contact
│   │   │   └── mutations/            # TanStack Query mutations
│   │   │       ├── contacts/
│   │   │       │   ├── useCreate.ts  # Create contact mutation
│   │   │       │   └── useDelete.ts  # Delete contact mutation
│   │   │       └── notes/
│   │   │           ├── useCreate.ts  # Create note mutation
│   │   │           └── useDelete.ts  # Delete note mutation
│   │   │
│   │   ├── lib/                      # Utility functions and clients
│   │   │   └── supabase/
│   │   │       ├── client.ts         # Supabase browser client
│   │   │       ├── server.ts         # Supabase server client
│   │   │       └── middleware.ts     # Session refresh middleware
│   │   │
│   │   ├── providers/                # Context providers setup
│   │   │   └── QueryProvider.tsx     # TanStack Query provider
│   │   │
│   │   ├── types/                    # TypeScript type definitions
│   │   │   ├── contacts.ts           # Contact types
│   │   │   └── notes.ts              # Note types
│   │   │
│   │   ├── globals.css               # Global styles
│   │   ├── layout.tsx                # Root layout wrapper
│   │   └── page.tsx                  # Home page (redirects to /contacts)
│   │
│   └── (all other Next.js app files)
│
├── public/                           # Static assets
├── .env                              # Environment variables (public)
├── package.json                      # Dependencies and scripts
├── tsconfig.json                     # TypeScript configuration
├── tailwind.config.js                # Tailwind CSS configuration
├── next.config.ts                    # Next.js configuration
└── middleware.ts                     # Next.js middleware for auth
```

## Key Folder Explanations

### `src/app/`
The main application directory using Next.js 13+ App Router. Organized by route and feature.

### `src/app/(auth)`
Authentication-related pages wrapped in a layout group. Contains the login/signup page.

### `src/app/(dashboard)`
Protected routes wrapped in a dashboard layout. Requires authentication to access.

### `src/app/api/`
Server-side API routes that handle data operations. All endpoints verify user authentication via Supabase.

### `src/app/components/`
Reusable UI components used across the application. Each component is self-contained and receives data via props.

### `src/app/context/`
React Context for global state management. Currently manages authentication state.

### `src/app/hooks/`
Custom React hooks divided into:
- **queries/**: Data fetching hooks using TanStack Query
- **mutations/**: Data modification hooks using TanStack Query

### `src/app/lib/`
Utility functions and external service clients:
- Supabase client initialization
- Server-side Supabase client
- Authentication middleware

### `src/app/providers/`
Context providers wrapped around the application. Currently provides TanStack Query setup.

### `src/app/types/`
TypeScript interfaces and types for type safety across the application.

## Architecture Overview

```
User Interface (Components)
        ↓
    React Hooks (Custom Hooks)
        ↓
TanStack Query (Data Management)
        ↓
API Routes (Next.js)
        ↓
Supabase (Database & Auth)
```

## Key Technologies

- **Next.js 16**: React framework with App Router
- **React 19**: UI library
- **TypeScript**: Type-safe JavaScript
- **TanStack Query 5**: Server state management
- **Supabase**: Backend-as-a-service (Auth + Database)
- **Tailwind CSS 4**: Utility-first CSS
- **Vercel SSR**: Session management

## Authentication Flow

1. User signs in via `/login` page
2. Supabase handles authentication
3. Session stored in cookies
4. Middleware refreshes session automatically
5. Protected routes check for authenticated user
6. `AuthContext` provides user state globally

## Data Flow

### Fetching Data
```
Component → useNotes() → TanStack Query → fetch() → API Route → Supabase
```

### Creating Data
```
Component → handleSubmit() → useCreateNote() → fetch() → API Route → Supabase
```

### Real-time Updates
```
Component → Supabase Realtime Subscription → Query Invalidation → Re-fetch
```

## Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Run ESLint
npm run lint
```

## Usage Examples

### Creating a Contact
1. Navigate to `/contacts`
2. Fill in the form (Name is required)
3. Click "Add Contact"
4. Contact appears in the list and is cached

### Adding a Note
1. Click on a contact from the list
2. Go to "Add Note" section
3. Type your note and submit
4. Note appears in the contact's notes list

### Deleting Data
1. Click the delete button on a contact or note
2. Data is removed from the database
3. UI updates optimistically via cache

## 🔍 Important Concepts

### TanStack Query Benefits
- Automatic caching of data
- Background refetching
- Optimistic updates
- Automatic deduplication
- Built-in loading/error states

### Query Keys
- `["contacts"]` - All contacts list
- `["contact", id]` - Single contact
- `["notes", contactId]` - Notes for a contact

### Real-time Subscriptions
The detail page subscribes to changes on the notes table and automatically refetches when changes occur.

## Troubleshooting

### "Unauthorized" errors
- Check that your Supabase URL and key are correct
- Verify Row Level Security policies are set up
- Ensure user is authenticated

### Data not updating
- Check browser console for errors
- Verify API endpoints are working
- Ensure Supabase tables exist

### Login issues
- Clear browser cookies
- Check `.env` variables
- Verify Supabase auth is enabled