import type { GlobalConfig } from 'payload'
import { anyone, authenticated } from '../access'

/**
 * Site-wide footer, in full: the "Download the App" banner, the link columns, the social
 * row, the payment-method logo row, the delivery-service logo row, and copyright.
 *
 * `appDownloadBanner` absorbs what was docs/10 §5.6's "App Download Strip" and the
 * previously-unconfirmed "Footer banner" — a real screenshot showed they're the same zone,
 * always rendered directly above the footer's link columns, not a Home-page block and not a
 * `Banners` placement. It's deliberately its own field group rather than a `Banners`
 * document: the generic Banner shape is one image/video plus one link, and this needs a QR
 * code plus two independent store links (App Store, Google Play) at once — it doesn't fit.
 */
export const Footer: GlobalConfig = {
  slug: 'footer',
  admin: {
    description:
      'Site-wide footer, including the "Download the App" banner directly above the link columns.',
  },
  access: { read: anyone, update: authenticated },
  fields: [
    {
      name: 'appDownloadBanner',
      type: 'group',
      label: 'App Download Banner',
      fields: [
        { name: 'backgroundImage', type: 'upload', relationTo: 'media', label: 'Background image' },
        {
          name: 'appPreviewImage',
          type: 'upload',
          relationTo: 'media',
          label: 'Phone preview image',
        },
        { name: 'logo', type: 'upload', relationTo: 'media' },
        { name: 'heading', type: 'text', defaultValue: 'Download the App' },
        { name: 'subheading', type: 'text', defaultValue: 'Available via App Store and Playstore' },
        { name: 'qrCode', type: 'upload', relationTo: 'media', label: 'QR code' },
        { name: 'appStoreUrl', type: 'text', label: 'App Store URL' },
        { name: 'googlePlayUrl', type: 'text', label: 'Google Play URL' },
      ],
    },
    {
      name: 'columns',
      type: 'array',
      labels: { singular: 'Column', plural: 'Columns' },
      fields: [
        { name: 'heading', type: 'text', required: true },
        {
          name: 'links',
          type: 'array',
          fields: [
            { name: 'label', type: 'text', required: true },
            {
              name: 'url',
              type: 'text',
              admin: {
                description:
                  'Leave blank to render this row as plain informational text rather than a link — e.g. "Store Business Hours," "Manila Stores: 9am - 9pm" in the Contact Us column.',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'socialLinks',
      type: 'array',
      labels: { singular: 'Social Link', plural: 'Social Links' },
      fields: [
        {
          name: 'platform',
          type: 'select',
          options: ['Facebook', 'Instagram', 'YouTube', 'TikTok'],
        },
        { name: 'url', type: 'text', required: true },
      ],
    },
    {
      name: 'paymentMethods',
      type: 'array',
      labels: { singular: 'Payment Method', plural: 'Payment Methods' },
      admin: {
        description: 'e.g. Visa, Mastercard, Amex, JCB, GCash, Maya, BDO, Cash on Delivery.',
      },
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'icon', type: 'upload', relationTo: 'media', required: true },
      ],
    },
    {
      name: 'deliveryServices',
      type: 'array',
      labels: { singular: 'Delivery Service', plural: 'Delivery Services' },
      admin: { description: 'e.g. SnapMart, Grab, Lalamove, AllEasy.' },
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'icon', type: 'upload', relationTo: 'media', required: true },
      ],
    },
    {
      name: 'copyrightText',
      type: 'text',
      defaultValue: '© Landers Superstore. Powered by SnapMart Inc.',
    },
  ],
}
