import type { GlobalConfig } from 'payload'
import { anyone, authenticated } from '../access'

/**
 * Mobile-only global chrome — the tab bar at the bottom of the app (Home / Orders /
 * Categories / Membership / Account, per the reviewed mobile screenshot). Had no component
 * entry anywhere before docs/12-cms-page-and-component-architecture.md §2.
 */
export const BottomNav: GlobalConfig = {
  slug: 'bottom-nav',
  admin: { description: 'Mobile-only bottom tab bar.' },
  access: { read: anyone, update: authenticated },
  fields: [
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      maxRows: 6,
      labels: { singular: 'Tab', plural: 'Tabs' },
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'icon', type: 'upload', relationTo: 'media' },
        { name: 'url', type: 'text', required: true },
      ],
    },
  ],
}
