import type { CollectionConfig } from 'payload'
import { authenticated, authenticatedOrPublished } from '../access'
import { notifyCacheInvalidation } from '../hooks/notifyCacheInvalidation'

/**
 * One document per sale/campaign event (e.g. "9 FOR ₱9"). The single source of truth every
 * linked Banner's countdown reads from — see `Banners.ts`'s `sale` + `showCountdown` fields.
 *
 * Deliberately presentation/timing-only: it does not reference participating SKUs. Actual
 * discount participation stays Medusa/Price Engine-owned via the existing `is_participating`
 * flag (docs/02-data-ownership-matrix.md); keeping this window aligned with the real
 * Price Engine promotion is a content-team coordination point, not a technical link.
 *
 * Distinct from the SoW's F-115 Sale Timer (per-SKU, Price Engine-driven, on the product
 * tile) — see docs/13-sale-banners-and-countdown-model.md §2 for why these are not merged.
 */
export const Sales: CollectionConfig = {
  slug: 'sales',
  labels: { singular: 'Sale', plural: 'Sales' },
  admin: {
    useAsTitle: 'internalTitle',
    defaultColumns: ['internalTitle', 'startDate', 'endDate', '_status', 'updatedAt'],
    description: 'A sale/campaign window. Banners link here for a synced countdown.',
  },
  access: {
    read: authenticatedOrPublished,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  hooks: {
    afterChange: [notifyCacheInvalidation('sales')],
  },
  versions: { drafts: true, maxPerDoc: 20 },
  fields: [
    {
      name: 'internalTitle',
      type: 'text',
      required: true,
      label: 'Internal title',
      admin: { description: 'e.g. "9 FOR ₱9 — Sept 2026". Not shown to customers.' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'startDate',
          type: 'date',
          required: true,
          admin: { date: { pickerAppearance: 'dayAndTime' }, width: '50%' },
        },
        {
          name: 'endDate',
          type: 'date',
          required: true,
          admin: {
            date: { pickerAppearance: 'dayAndTime' },
            width: '50%',
            description: "Every linked banner's countdown reads this value.",
          },
        },
      ],
    },
  ],
}
