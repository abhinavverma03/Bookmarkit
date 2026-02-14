'use client'

import { useRef, useState } from 'react'
import { addBookmark } from '@/app/actions/bookmarks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { notifyBookmarksChanged } from '@/lib/bookmark-sync'

interface BookmarkFormProps {
  onBookmarkAdded?: () => void
}

export function BookmarkForm({ onBookmarkAdded }: BookmarkFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    const result = await addBookmark(formData)
    
    if (result.error) {
      toast.error('Failed to add bookmark', {
        description: result.error,
      })
    } else {
      toast.success('Bookmark added successfully')
      formRef.current?.reset()
      notifyBookmarksChanged()
      onBookmarkAdded?.()
    }
    
    setIsSubmitting(false)
  }

  return (
    <Card className="p-6">
      <form ref={formRef} action={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            type="text"
            placeholder="My Favorite Website"
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="url">URL</Label>
          <Input
            id="url"
            name="url"
            type="url"
            placeholder="https://example.com"
            required
            disabled={isSubmitting}
          />
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          {isSubmitting ? 'Adding...' : 'Add Bookmark'}
        </Button>
      </form>
    </Card>
  )
}
