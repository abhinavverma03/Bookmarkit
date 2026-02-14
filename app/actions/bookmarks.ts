'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface Bookmark {
  id: string
  user_id: string
  title: string
  url: string
  created_at: string
  updated_at: string
}

export async function getBookmarks(): Promise<{ bookmarks: Bookmark[] | null; error: string | null }> {
  const supabase = await createClient()
  
  const { data: bookmarks, error } = await supabase
    .from('bookmarks')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[v0] Get bookmarks error:', error)
    return { bookmarks: null, error: error.message }
  }

  return { bookmarks, error: null }
}

export async function addBookmark(formData: FormData) {
  const title = formData.get('title') as string
  const url = formData.get('url') as string

  if (!title || !url) {
    return { error: 'Title and URL are required' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('bookmarks')
    .insert({
      user_id: user.id,
      title,
      url,
    })

  if (error) {
    console.error('[v0] Add bookmark error:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { error: null }
}

export async function deleteBookmark(bookmarkId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('id', bookmarkId)

  if (error) {
    console.error('[v0] Delete bookmark error:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { error: null }
}
