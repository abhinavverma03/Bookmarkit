# Bookmarkit

A modern, real-time bookmark manager built with Next.js, Supabase, and Tailwind CSS.

## Features

- **Google OAuth Authentication**: Secure sign-in using Google accounts only (no email/password)
- **Private Bookmarks**: Each user can only see and manage their own bookmarks
- **Real-time Updates**: Bookmarks sync instantly across multiple tabs without page refresh
- **Simple Interface**: Clean, intuitive UI for adding, viewing, and deleting bookmarks
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Next.js 16** (App Router)
- **Supabase** (Authentication, Database, Realtime)
- **Tailwind CSS** (Styling)
- **TypeScript**
- **shadcn/ui** (UI Components)

## Setup Instructions

### 1. Prerequisites

- A Supabase account and project
- Google OAuth credentials configured in Supabase

### 2. Configure Google OAuth in Supabase

1. Go to your Supabase project dashboard
2. Navigate to Authentication > Providers
3. Enable Google provider
4. Follow Supabase's instructions to set up Google OAuth:
   - Create OAuth credentials in Google Cloud Console
   - Add the authorized redirect URI: `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`
   - Copy the Client ID and Client Secret to Supabase

### 3. Environment Variables

The following environment variables are automatically configured via the Supabase integration:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4. Database Setup

The database migration has been applied automatically, creating:

- `bookmarks` table with columns: `id`, `user_id`, `title`, `url`, `created_at`, `updated_at`
- Row Level Security (RLS) policies ensuring users can only access their own bookmarks
- Real-time subscription enabled on the bookmarks table

### 5. Deploy to Vercel

1. Push your code to a GitHub repository
2. Import the project to Vercel
3. The Supabase integration will automatically configure environment variables
4. Deploy!

## How It Works

### Authentication Flow

1. User clicks "Sign in with Google" on the landing page
2. Redirected to Google OAuth consent screen
3. After successful authentication, redirected back to `/auth/callback`
4. Session is established and user is redirected to `/dashboard`

### Bookmark Management

- **Add**: Enter a title and URL in the form, click "Add Bookmark"
- **View**: All bookmarks are displayed in a list, sorted by creation date (newest first)
- **Delete**: Click the trash icon to remove a bookmark
- **Real-time**: Open the app in two tabs, add a bookmark in one tab, and it appears instantly in the other

### Real-time Implementation

The app uses Supabase's real-time feature to subscribe to database changes:

```typescript
supabase
  .channel('bookmarks-changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'bookmarks',
    filter: `user_id=eq.${user.id}`,
  }, () => {
    // Reload bookmarks when changes detected
  })
  .subscribe()
```

## Problems Encountered and Solutions

### Problem 1: Setting up Supabase SSR with Next.js 16

**Challenge**: Next.js 16 made `params`, `searchParams`, `headers`, and `cookies` asynchronous, requiring await calls.

**Solution**: Updated all server-side code to properly await these async APIs:
```typescript
const cookieStore = await cookies()
const headersList = await headers()
```

### Problem 2: Configuring Row Level Security (RLS)

**Challenge**: Ensuring users can only access their own bookmarks while allowing real-time updates.

**Solution**: Created comprehensive RLS policies for SELECT, INSERT, UPDATE, and DELETE operations that check `auth.uid() = user_id`, and enabled real-time publication for the bookmarks table.

### Problem 3: Real-time Updates Across Tabs

**Challenge**: Making bookmarks appear instantly in multiple open tabs without manual refresh.

**Solution**: Implemented Supabase real-time subscriptions with proper cleanup:
- Subscribe to postgres_changes filtered by user_id
- Reload bookmarks when any change is detected
- Clean up subscription in useEffect cleanup function

### Problem 4: Google OAuth Redirect Configuration

**Challenge**: Ensuring OAuth callbacks work correctly in both development and production environments.

**Solution**: Implemented dynamic redirect URL handling:
```typescript
const origin = headersList.get('origin') || 'http://localhost:3000'
redirectTo: `${origin}/auth/callback`
```

## Project Structure

```
├── app/
│   ├── actions/
│   │   ├── auth.ts          # Authentication server actions
│   │   └── bookmarks.ts     # Bookmark CRUD server actions
│   ├── auth/
│   │   ├── callback/        # OAuth callback handler
│   │   └── auth-code-error/ # Error page
│   ├── dashboard/
│   │   └── page.tsx         # Protected dashboard route
│   ├── layout.tsx           # Root layout with fonts and toaster
│   ├── globals.css          # Global styles and design tokens
│   └── page.tsx             # Landing/login page
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── dashboard.tsx        # Main dashboard component
│   ├── login-page.tsx       # Login page component
│   ├── bookmark-form.tsx    # Add bookmark form
│   └── bookmark-list.tsx    # Bookmark list display
├── lib/
│   └── supabase/
│       ├── client.ts        # Browser Supabase client
│       └── server.ts        # Server Supabase client
├── scripts/
│   └── setup-bookmarks-table.sql  # Database migration
└── middleware.ts            # Auth session refresh
```

## Testing the App

1. Sign in with your Google account
2. Add a bookmark with a title and URL
3. Open the app in a second browser tab (or incognito window with the same account)
4. Add a bookmark in one tab
5. Watch it appear instantly in the other tab without refreshing
6. Delete a bookmark and see it disappear in real-time
7. Sign out from one tab

## Live Demo

Deploy this project to Vercel and test with your own Google account!

## License

MIT
