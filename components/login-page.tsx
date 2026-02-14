'use client'

import { signInWithGoogle } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Bookmark } from 'lucide-react'

export function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md text-center space-y-8">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-foreground rounded-2xl flex items-center justify-center">
            <Bookmark className="w-8 h-8 text-background" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-balance">
            Bookmarkit
          </h1>
        </div>

        <p className="text-lg text-muted-foreground text-balance max-w-lg mx-auto">
          Save, organize, and access your favorite links instantly. Sign in with Google to get started.
        </p>

        <form action={signInWithGoogle}>
          <Button 
            type="submit"
            size="lg"
            className="w-full max-w-xs h-12 text-base font-medium"
          >
            Sign in with Google
          </Button>
        </form>

        <p className="text-sm text-muted-foreground">
          Your bookmarks are private and synced in real-time
        </p>
      </div>
    </div>
  )
}
