import { getUser } from '@/app/actions/auth'
import { redirect } from 'next/navigation'
import { Dashboard } from '@/components/dashboard'

export default async function DashboardPage() {
  const { user } = await getUser()

  if (!user) {
    redirect('/')
  }

  return <Dashboard user={user} />
}
