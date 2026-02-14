'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export async function signInWithGoogle() {
  const supabase = await createClient()
  const headersList = await headers()
  const origin = headersList.get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    console.error('[v0] Google sign in error:', error)
    return { error: error.message }
  }

  if (data.url) {
    redirect(data.url)
  }
}

export async function signOut() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('[v0] Sign out error:', error)
    return { error: error.message }
  }

  redirect('/')
}

export async function getUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    console.error('[v0] Get user error:', error)
    return { user: null, error: error.message }
  }

  return { user, error: null }
}
