import type { GlobalConfig } from 'payload'
import { anyone, authenticated } from '../access'

/**
 * The desktop-only right-side promotional rail (docs/12 §2) — confirmed to show the same
 * tiles on both Home and a PLP-style page, so it's curated once, site-wide, rather than
 * per-page.
 *
 * A single-entry assignment list, not a `Banners` placement. `placements` (Banners.ts) is a
 * pull model — a banner tags itself with a surface, and nothing says which subset of
 * same-tagged banners is showing right now or in what order. That's the right shape for
 * PLP (no Payload document exists for a PLP page to hold a curated list against), but wrong
 * here: the content team needs to explicitly choose which banners occupy the rail and in
 * what order, the same way they'd curate a physical shelf.
 *
 * `banners` is a `hasMany` relationship rather than an array-of-relationships — Payload
 * relationship fields with `hasMany: true` are reorderable in the admin UI and preserve that
 * order on read, so no wrapper array is needed just to get ordering.
 */
export const RightRail: GlobalConfig = {
  slug: 'right-rail',
  admin: {
    description:
      'Desktop-only sidebar banners, shown on Home and PLP alike. Order here is display order, top to bottom.',
  },
  access: { read: anyone, update: authenticated },
  fields: [
    {
      name: 'banners',
      type: 'relationship',
      relationTo: 'banners',
      hasMany: true,
      admin: { description: 'Drag to reorder.' },
    },
  ],
}
