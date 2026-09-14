import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '../access'

/**
 * Uploads. `imageSizes` exist so Phase 4 can check whether the S3/CDN adapter uploads
 * derivatives alongside the original, or only the original.
 *
 * `mimeTypes` includes video/* for the Media field's video mode (banners, docs/12 §3.1) —
 * `imageSizes` only affects image files, sharp skips derivatives for anything else.
 */
export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  upload: {
    imageSizes: [
      { name: 'thumbnail', width: 300, height: 300, position: 'centre' },
      { name: 'card', width: 768, height: 512, position: 'centre' },
      { name: 'hero', width: 1920, height: undefined, position: 'centre' },
    ],
    focalPoint: true,
    mimeTypes: ['image/*', 'video/*'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: { description: 'Accessibility text. Required.' },
    },
  ],
}
