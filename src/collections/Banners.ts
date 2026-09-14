import type { CollectionConfig } from 'payload'
import { authenticatedOrPublished, canEditContent } from '../access'
import { linkField } from '../fields/link'
import { mediaField } from '../fields/media'
import { notifyCacheInvalidation } from '../hooks/notifyCacheInvalidation'

const SURFACE_OPTIONS = [
  { label: 'Home — Hero Carousel', value: 'home-hero' },
  { label: 'Home — Standalone Campaign Banner', value: 'home-standalone' },
  { label: 'PLP / Category Banner', value: 'plp' },
  { label: 'Sticky Sale Bar', value: 'sticky-bar' },
] as const

/**
 * The single collection behind most CMS banner surfaces: Home's Hero Carousel and
 * Standalone Campaign Banner, the PLP/Category banner (docs/11 §7), and the Sticky Sale Bar
 * (docs/13). A banner declares WHERE it shows via `placements`, rather than each page
 * linking out to banners — required for PLP, which is a Medusa category or collection, not
 * a Payload document, so nothing on the Payload side could hold that relationship the other
 * way around.
 *
 * Two zones deliberately don't use `placements`:
 * - The Right-side Promotional Rail — see `globals/RightRail.ts`. A curated, ordered,
 *   site-wide list (the content team picks which banners and in what order), which
 *   `placements`' pull-and-tag model can't express; it only works for PLP because there's
 *   no document on the Payload side to curate against.
 * - The Footer's "Download the App" banner (formerly "Footer banner" in the docs) — it
 *   turned out to be `globals/Footer.ts`'s `appDownloadBanner`, not a `Banners` document at
 *   all: it needs a QR code plus two independent store links at once, which the generic
 *   Banner shape (one image/video, one link) can't hold.
 *
 * F-056 (final SoW p.135)'s "Multiple placements" language is exactly this: one banner, more
 * than one `placements` row.
 *
 * Scheduling is two plain date fields checked at read time (`startDate`/`endDate`), per the
 * POC's own finding (docs/feasibility/REPORT.md: "Scheduled publishing: Not built.
 * Modellable as a date-window field; no Payload feature needed") — not Payload's
 * `schedulePublish` on `versions.drafts`, which only schedules when a draft goes live, not
 * when it comes back down again.
 *
 * See docs/11-banner-specifications.md and docs/13-sale-banners-and-countdown-model.md in
 * the project root for the requirement/solution writeup this implements.
 */
export const Banners: CollectionConfig = {
  slug: 'banners',
  labels: { singular: 'Banner', plural: 'Banners' },
  admin: {
    useAsTitle: 'internalTitle',
    defaultColumns: ['internalTitle', 'startDate', 'endDate', '_status', 'updatedAt'],
    description:
      "Hero Carousel, Standalone Campaign Banner, PLP, Sticky Sale Bar — where a banner shows is set in Placements below. The Right Rail is assigned separately (Globals → Right Rail); the Footer's app-download banner is a field on Globals → Footer, not a Banners document at all.",
  },
  access: {
    read: authenticatedOrPublished,
    // Content Manager and IT/Engineering only -- demonstrates the role-based policies in
    // src/access/index.ts (docs/15-platform-capabilities.md §4). Finance, Leadership, CS
    // Agent, and Operations can log in and read, but not create/edit/delete banners.
    create: canEditContent,
    update: canEditContent,
    delete: canEditContent,
  },
  hooks: {
    afterChange: [notifyCacheInvalidation('banners')],
  },
  versions: { drafts: true, maxPerDoc: 20 },
  fields: [
    {
      name: 'internalTitle',
      type: 'text',
      required: true,
      label: 'Internal title',
      admin: { description: 'Editor-facing label. Not shown to customers.' },
    },
    mediaField('creative', { required: true }),
    linkField('link'),
    {
      type: 'row',
      fields: [
        {
          name: 'startDate',
          type: 'date',
          label: 'Show from',
          admin: {
            date: { pickerAppearance: 'dayAndTime' },
            width: '50%',
            description: 'Leave blank to show as soon as published.',
          },
        },
        {
          name: 'endDate',
          type: 'date',
          label: 'Show until',
          admin: {
            date: { pickerAppearance: 'dayAndTime' },
            width: '50%',
            description: 'Leave blank for no end date.',
          },
        },
      ],
    },
    {
      name: 'sale',
      type: 'relationship',
      relationTo: 'sales',
      admin: {
        description:
          'Optional — link a Sale so this banner can show a live countdown to its end date.',
      },
    },
    {
      name: 'showCountdown',
      type: 'checkbox',
      defaultValue: false,
      label: 'Show countdown',
      admin: {
        condition: (data) => Boolean(data?.sale),
        description: "Render a live countdown to the linked Sale's end date on this banner.",
      },
    },
    {
      name: 'placements',
      type: 'array',
      required: true,
      minRows: 1,
      labels: { singular: 'Placement', plural: 'Placements' },
      admin: {
        description:
          'Where this banner appears. F-056\'s "Multiple placements" — one banner can occupy more than one surface at once.',
      },
      fields: [
        {
          name: 'surface',
          type: 'select',
          required: true,
          options: [...SURFACE_OPTIONS],
        },
        {
          name: 'medusaCategoryId',
          type: 'text',
          label: 'Medusa category/collection ID',
          admin: {
            condition: (_, siblingData) => siblingData?.surface === 'plp',
            description:
              'The Medusa category, collection, or subcategory ID this banner is scoped to. Leave blank to show on every PLP — open question, docs/11-banner-specifications.md §7.',
          },
        },
      ],
    },
  ],
}
