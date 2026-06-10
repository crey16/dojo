export function DemoModeBanner() {
  return (
    <div className="bg-yellow-400 border-b-4 border-yellow-600 px-4 py-2 text-center">
      <p className="text-sm font-black text-yellow-900">
        🎮 DEMO MODE — Supabase not configured. All data is fake. <a href="/.env.example" className="underline">Setup guide</a>
      </p>
    </div>
  )
}
