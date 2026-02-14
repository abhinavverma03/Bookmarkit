import { getUser } from '@/app/actions/auth'
import { redirect } from 'next/navigation'
import { LoginPage } from '@/components/login-page'

export default async function Home() {
  const { user } = await getUser()

  if (user) {
    redirect('/dashboard')
  }

  return <LoginPage />
}
