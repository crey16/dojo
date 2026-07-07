export function DemoModeBanner() {
  return (
    <div className="bg-gold-soft px-4 py-2 text-center">
      <p className="text-xs font-black text-gold-ink">
        Demo mode — Supabase not configured. All data is fake. <a href="/.env.example" className="underline">Setup guide</a>
      </p>
    </div>
  )
}
