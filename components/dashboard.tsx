'use client'

import { useEffect, useState, useCallback } from 'react'
import { User } from '@supabase/supabase-js'
import { signOut } from '@/app/actions/auth'
import { getBookmarks, type Bookmark } from '@/app/actions/bookmarks'
import { BookmarkForm } from '@/components/bookmark-form'
import { BookmarkList } from '@/components/bookmark-list'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Bookmark as BookmarkIcon, LogOut } from 'lucide-react'
import { useRealtimeBookmarks } from '@/hooks/use-realtime-bookmarks'
import { subscribeToBookmarksChanged } from '@/lib/bookmark-sync'

interface DashboardProps {
  user: User
}

export function Dashboard({ user }: DashboardProps) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadBookmarks = useCallback(async () => {
    const { bookmarks: data, error } = await getBookmarks()
    if (!error && data) {
      setBookmarks(data)
    }
    setIsLoading(false)
  }, [])

  // Handle realtime bookmark changes
  const handleBookmarkChange = useCallback((bookmark: Bookmark, type: 'INSERT' | 'UPDATE' | 'DELETE') => {
    if (type === 'INSERT') {
      setBookmarks((prev) => {
        // Avoid duplicates
        if (prev.some((b) => b.id === bookmark.id)) {
          return prev
        }
        return [bookmark, ...prev]
      })
    } else if (type === 'DELETE') {
      setBookmarks((prev) => prev.filter((b) => b.id !== bookmark.id))
    } else if (type === 'UPDATE') {
      setBookmarks((prev) =>
        prev.map((b) => (b.id === bookmark.id ? bookmark : b))
      )
    }
  }, [])

  // Load initial bookmarks
  useEffect(() => {
    loadBookmarks()
  }, [loadBookmarks])

  // Setup realtime subscription
  useRealtimeBookmarks(user.id, handleBookmarkChange)

  // Sync bookmark updates across browser tabs
  useEffect(() => {
    return subscribeToBookmarksChanged(loadBookmarks)
  }, [loadBookmarks])

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <BookmarkIcon className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold">Bookmarkit</h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="text-sm text-muted-foreground hidden sm:block">
              {user.email}
            </div>
            <form action={signOut}>
              <Button type="submit" variant="ghost" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">Add Bookmark</h2>
          <BookmarkForm onBookmarkAdded={loadBookmarks} />
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">
            Your Bookmarks {!isLoading && `(${bookmarks.length})`}
          </h2>
          <BookmarkList bookmarks={bookmarks} isLoading={isLoading} onBookmarkDeleted={loadBookmarks} />
        </section>
      </main>
    </div>
  )
}
