import type { GlobalConfig } from 'payload'
import { anyone, authenticated } from '../access'

/**
 * Site-wide top navigation — logo, search placeholder, membership CTA, utility links
 * (Help, Cart, Track Orders). A Global, not a collection: there is exactly one Header.
 * Out of the POC's original scope ("No globals... would demonstrate nothing the collections
 * above do not already" — payload.config.ts) because that comment was scoped to the POC's
 * six technical questions, not a permanent decision against Globals.
 *
 * See docs/12-cms-page-and-component-architecture.md §2.
 */
export const Header: GlobalConfig = {
  slug: 'header',
  admin: { description: 'Site-wide top navigation.' },
  access: { read: anyone, update: authenticated },
  fields: [
    { name: 'logo', type: 'upload', relationTo: 'media', required: true },
    { name: 'searchPlaceholder', type: 'text', defaultValue: 'What are you looking for?' },
    {
      name: 'membershipCta',
      type: 'group',
      fields: [
        { name: 'label', type: 'text', defaultValue: 'Apply Membership' },
        { name: 'url', type: 'text', required: true },
      ],
    },
    {
      name: 'utilityLinks',
      type: 'array',
      labels: { singular: 'Link', plural: 'Links' },
      admin: { description: 'e.g. Help, Track Orders.' },
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'url', type: 'text', required: true },
      ],
    },
  ],
}
