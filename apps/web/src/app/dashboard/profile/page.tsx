import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileContent from './components/ProfileContent'

export default async function OwnerProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!userData) {
    redirect('/login')
  }

  return <ProfileContent userData={userData} />
}
