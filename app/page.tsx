import { redirect } from 'next/navigation'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { MOCK_GROUP_ID } from '@/lib/mock-data'
import { MonsterAvatar } from '@/components/MonsterAvatar'
import Link from 'next/link'

export default async function RootPage() {
  if (isSupabaseConfigured()) {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      if (data) {
        redirect(`/groups/${data.group_id}/dashboard`)
      } else {
        redirect('/groups/create')
      }
    } else {
      redirect('/login')
    }
  }

  // Demo mode — show landing
  return (
    <div className="min-h-screen bg-canvas flex flex-col items-center justify-center p-6 text-center">
      <div className="flex items-end justify-center gap-1 mb-6">
        <MonsterAvatar name="Kaison" size="md" className="animate-floaty -mb-1" />
        <MonsterAvatar name="Collin" size="lg" className="animate-floaty" />
        <MonsterAvatar name="Jordan" size="md" className="animate-floaty -mb-1" />
      </div>
      <h1 className="font-display font-bold text-5xl text-ink mb-1">HCWK Dojo</h1>
      <p className="text-base font-extrabold text-body mb-1">Holy Chat Without Kaison</p>
      <p className="text-[13px] font-bold text-muted mb-10 max-w-xs">
        The private ClassDojo for your group chat. Earn points, complete challenges, and climb the leaderboard.
      </p>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Link
          href={`/groups/${MOCK_GROUP_ID}/dashboard`}
          className="bg-primary text-white font-black text-base h-12 flex items-center justify-center rounded-full btn-edge hover:bg-primary-dark active:translate-y-px transition-all"
        >
          Try demo mode
        </Link>
        <Link
          href="/login"
          className="bg-primary-soft text-primary-dark font-black text-sm py-3 px-8 rounded-full hover:bg-[#EBE4F9] active:translate-y-px transition-all"
        >
          Log in
        </Link>
        <Link
          href="/signup"
          className="text-[13px] font-black text-primary hover:text-primary-dark py-2 transition-colors"
        >
          No account yet? Sign up
        </Link>
      </div>

      <div className="mt-12 flex gap-7 text-center">
        {['Points', 'Leaderboard', 'Challenges', 'Rewards'].map(label => (
          <span key={label} className="text-xs font-extrabold text-muted">{label}</span>
        ))}
      </div>
    </div>
  )
}
