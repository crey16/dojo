import { redirect } from 'next/navigation'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { MOCK_GROUP_ID } from '@/lib/mock-data'
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
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-yellow-400 flex flex-col items-center justify-center p-6 text-white text-center">
      <div className="animate-float text-8xl mb-6">🥋</div>
      <h1 className="text-5xl font-black mb-2 drop-shadow-lg">HCWK Dojo</h1>
      <p className="text-xl font-bold opacity-90 mb-1">Holy Chat Without Kaison</p>
      <p className="text-sm opacity-75 mb-10 max-w-xs">The private ClassDojo for your group chat. Earn points, complete challenges, and climb the leaderboard.</p>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Link
          href={`/groups/${MOCK_GROUP_ID}/dashboard`}
          className="bg-white text-purple-700 font-black text-lg py-4 px-8 rounded-2xl border-b-4 border-yellow-400 shadow-lg hover:bg-purple-50 active:scale-95 transition-all"
        >
          🎮 Try Demo Mode
        </Link>
        <Link
          href="/login"
          className="bg-purple-800 bg-opacity-60 text-white font-bold text-base py-3 px-8 rounded-2xl border-b-4 border-purple-900 hover:bg-opacity-80 active:scale-95 transition-all"
        >
          🔐 Login
        </Link>
        <Link
          href="/signup"
          className="bg-transparent text-white font-semibold text-sm py-2 underline underline-offset-2 hover:opacity-80 transition-opacity"
        >
          No account yet? Sign up
        </Link>
      </div>

      <div className="mt-12 flex gap-6 text-center">
        {[
          { emoji: '🔥', label: 'Points' },
          { emoji: '🏆', label: 'Leaderboard' },
          { emoji: '⚔️', label: 'Challenges' },
          { emoji: '🎁', label: 'Rewards' },
        ].map(item => (
          <div key={item.label} className="flex flex-col items-center gap-1">
            <span className="text-2xl">{item.emoji}</span>
            <span className="text-xs font-bold opacity-80">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
