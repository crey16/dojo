# HCWK Dojo — Design Prompt (ClassDojo aesthetic)

A self-contained design brief for a visual design workspace. It assumes no codebase access,
so everything needed is described in the prompt. Built with the video's method:
reference images (Level 2), codified design rules acting as an inline design skill (Level 3),
and a design-identity extraction of ClassDojo (Level 7).

**How to use:** gather 4–6 reference screenshots (list at the bottom), attach them, then
paste the prompt below.

---

## THE PROMPT (paste everything between the lines, screenshots attached)

---

Design **HCWK Dojo** — a private, free ClassDojo-style web app for a small friend group
(HCWK = "Holy Chat Without Kaison"). Friends earn and lose points for group-chat behavior,
climb a leaderboard, complete challenges, and redeem silly rewards. Everyone has a
procedurally-generated monster avatar. Mobile-first PWA with bottom navigation; desktop
gets a sidebar. No messaging, no payments — just points and fun.

My current build looks too generic — template-style output with Comic Sans, purple-pink
gradients, gray backgrounds, and emoji as icons. Redesign it to feel like a real,
lovingly-crafted product in the ClassDojo family, without copying ClassDojo's characters,
logo, or assets.

### Design identity (extracted from ClassDojo — follow this DNA)

- **Mood:** warm, friendly, slightly goofy, but *professionally* playful. ClassDojo is not
  chaotic — the chrome (nav, headers, cards) is calm and soft; the playfulness lives in
  avatars, point moments, and celebrations. Content is the fun part, the frame is quiet.
- **Color:** one dominant brand color used confidently. Primary: purple `#7C3AED`. The rest
  of the palette is *semantic only*: green `#22C55E` = positive points, red `#EF4444` =
  negative points, yellow `#FBBF24` = celebration/streaks/crowns, blue = informational.
  Never more than 3 hues in one viewport. Canvas is warm off-white (`#FAF9F6`), cards pure
  white. No cold gray backgrounds, no purple→pink gradient headers.
- **Shape:** big radii (16–24px cards, fully-rounded pills for buttons/badges/chips), soft
  diffuse shadows (`0 2px 8px rgba(0,0,0,0.06)`) instead of hard borders. Buttons are
  chunky and tactile — like candy: a subtle darker bottom edge and a press-down state.
- **Typography:** rounded geometric sans. Display: **Baloo 2** or **Nunito 800/900** —
  heavy, tight, friendly. Body: Nunito 600/700, dark gray `#374151`, highly legible.
  Point values and scores use extra-bold tabular numbers. Absolutely no Comic Sans.
- **Illustration:** monster avatars carry the personality. Give them room — large on
  profiles and leaderboard podium, each sitting on a soft pastel circle tinted to that
  member's color. Subtle idle float only in hero placements, never in dense lists.
- **Celebration:** awarding points, approving a challenge, redeeming a reward = confetti
  burst + a bouncy scale-in of the point value. These are the loudest moments in the app;
  everything else stays quiet so they land.

### Screens to design (mobile-first, 390px, plus one desktop dashboard view)

1. **Dashboard** — greeting with your monster, your weekly points, quick stats, recent
   activity feed (who earned/lost what and why).
2. **Leaderboard** — weekly + all-time tabs. Ranks 1–3 get a podium treatment: gold/
   silver/bronze medal chips, larger avatars, crown on #1. Everyone else in a clean list
   with point pills.
3. **Roster / Members grid** — ClassDojo's signature view: a grid of member cards, monster
   avatar + name + point bubble, tappable to award points.
4. **Award points sheet** — pick a category: positive (Carried the Chat +5, Actually Made
   Plans +7, Funny Message +3, Helped Someone +5, Clutch Behavior +8) or negative (Dry
   Response −2, Flaked −7, Bad Take −4, Ghosted the Chat −5, Unholy Behavior −10).
   Positive = green pills, negative = red pills.
5. **Challenges** — active challenge cards with reward value + submit button; past
   challenges with won/lost states.
6. **Rewards** — redeemable reward cards with point costs, plus redemption history.
7. **Member profile** — big avatar hero, point history, badges/streaks.
8. **Admin panel** — denser, but same primitives; never feels like a different app.

### Component rules (the de-vibecode checklist)

- Bottom nav: raised white bar, soft top shadow; active tab = filled primary pill behind
  icon + label; icons bounce subtly on tap.
- One card recipe app-wide: white, 16–20px radius, soft shadow, consistent 16/24px padding.
- Spacing scale: 4/8/12/16/24/32 only.
- Point chips are one consistent component: green `+N` / red `−N` pill, springy pop-in.
- Buttons: primary = filled purple with darker bottom edge, pill-shaped, bold, min 48px
  tall on mobile. Secondary = soft purple-50 tint. Destructive = soft red tint.
- Icons: a single consistent rounded line-icon set. Emoji allowed only inside user content
  (challenge and reward names), never as UI icons.
- Empty states: small friendly monster illustration + one sentence + one CTA. Never bare
  "No data" text.
- Motion: springy and short (150–300ms), only on point awards, tab changes, card presses,
  confetti, and avatar hero idle. Respect reduced-motion.
- Bright daytime app — no dark chrome anywhere.

Use the attached screenshots as mood references only — capture the *feel* of ClassDojo,
don't copy its mojo monsters, logo, or assets. Our monsters are our own.

---

## Reference images to gather (attach 4–6)

1. **"ClassDojo teacher dashboard screenshot"** — roster grid with monster cards and point
   bubbles; the core target for our roster view.
2. **"ClassDojo give points screen"** — how point categories and +/− values are presented.
3. **ClassDojo App Store screenshots page** — current colors, nav, and card language.
4. **classdojo.com homepage hero** — typography, illustration, and color mood.
5. **Mobbin.com → "Duolingo"** — 1–2 screens for chunky buttons + celebration moments.
6. Optional: **Dribbble → "kids app leaderboard"** — one shot you like for the podium.

## Notes

- When you're happy with the visual design output, screenshot the designs and bring them
  back to the implementation workflow as Level-2 references: "match these screens exactly"
  — that closes the loop between design and implementation.
- Level 7 alternative: if your design workspace has web access, replace the
  screenshots with: "Visit classdojo.com and extract a design blueprint — exact palette,
  type scale, spacing, shadows, radii, tone — then apply it per this brief."
