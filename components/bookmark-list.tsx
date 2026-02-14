'use client'

import { useState } from 'react'
import { deleteBookmark, type Bookmark } from '@/app/actions/bookmarks'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ExternalLink, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { notifyBookmarksChanged } from '@/lib/bookmark-sync'

interface BookmarkListProps {
  bookmarks: Bookmark[]
  isLoading: boolean
  onBookmarkDeleted?: () => void
}

export function BookmarkList({ bookmarks, isLoading, onBookmarkDeleted }: BookmarkListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(bookmarkId: string) {
    setDeletingId(bookmarkId)
    const result = await deleteBookmark(bookmarkId)
    
    if (result.error) {
      toast.error('Failed to delete bookmark', {
        description: result.error,
      })
    } else {
      toast.success('Bookmark deleted')
      notifyBookmarksChanged()
      onBookmarkDeleted?.()
    }
    
    setDeletingId(null)
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </Card>
        ))}
      </div>
    )
  }

  if (bookmarks.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground text-lg">
          No bookmarks yet. Add your first bookmark above!
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {bookmarks.map((bookmark) => (
        <Card key={bookmark.id} className="p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold mb-2 truncate">
                {bookmark.title}
              </h3>
              <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 group"
              >
                <span className="truncate">{bookmark.url}</span>
                <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(bookmark.id)}
              disabled={deletingId === bookmark.id}
              className="flex-shrink-0"
            >
              <Trash2 className="w-4 h-4" />
              <span className="sr-only">Delete bookmark</span>
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
}
