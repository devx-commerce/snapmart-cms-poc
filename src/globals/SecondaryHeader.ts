import type { GlobalConfig } from 'payload'
import { anyone, authenticated } from '../access'

/**
 * The utility row below the main header nav ("Download the App · About Landers · The
 * Landers Experience · Delivery Areas · Track Orders" in the reviewed designs). Kept as its
 * own Global, separate from Header, since its exact identity is not yet confirmed against a
 * named Figma node — see docs/12-cms-page-and-component-architecture.md §4 open items.
 */
export const SecondaryHeader: GlobalConfig = {
  slug: 'secondary-header',
  admin: { description: 'The utility link row below the main header nav.' },
  access: { read: anyone, update: authenticated },
  fields: [
    {
      name: 'links',
      type: 'array',
      required: true,
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'url', type: 'text', required: true },
      ],
    },
  ],
}
