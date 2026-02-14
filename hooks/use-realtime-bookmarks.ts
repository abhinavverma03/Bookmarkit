import { useEffect, useCallback } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { Bookmark } from '@/app/actions/bookmarks'

export function useRealtimeBookmarks(
  userId: string | undefined,
  onBookmarkChange: (bookmark: Bookmark, type: 'INSERT' | 'UPDATE' | 'DELETE') => void
) {
  useEffect(() => {
    if (!userId) return

    const supabase = createClient()

    console.log('[v0] Setting up realtime subscription for user:', userId)

    // Subscribe to all changes on the bookmarks table for this user
    const subscription = supabase
      .channel(`bookmarks-realtime-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bookmarks',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('[v0] INSERT event received:', payload.new)
          onBookmarkChange(payload.new as Bookmark, 'INSERT')
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'bookmarks',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('[v0] DELETE event received:', payload.old)
          onBookmarkChange(payload.old as Bookmark, 'DELETE')
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookmarks',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('[v0] UPDATE event received:', payload.new)
          onBookmarkChange(payload.new as Bookmark, 'UPDATE')
        }
      )
      .subscribe((status) => {
        console.log('[v0] Realtime subscription status:', status)
        if (status === 'SUBSCRIBED') {
          console.log('[v0] Successfully subscribed to realtime events')
        } else if (status === 'CLOSED') {
          console.log('[v0] Subscription closed')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[v0] Channel error - retrying...')
        }
      })

    return () => {
      console.log('[v0] Cleaning up realtime subscription')
      supabase.removeChannel(subscription)
    }
  }, [userId, onBookmarkChange])
}
