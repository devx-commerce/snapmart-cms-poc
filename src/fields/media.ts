import type { Field } from 'payload'

interface MediaFieldOptions {
  required?: boolean
  /** `imageOnly` omits the image/video toggle entirely — for thumbnails that are never video
   * (Landers Experience story cards, category tiles), where the video is a separate plain
   * link field on the parent, not this component. Default `both` — Banners' creative can be
   * either. */
  mode?: 'both' | 'imageOnly'
}

const isImage = (_: unknown, siblingData: Record<string, unknown>): boolean =>
  siblingData?.mediaType !== 'video'
const isVideo = (_: unknown, siblingData: Record<string, unknown>): boolean =>
  siblingData?.mediaType === 'video'

/**
 * The reusable "Media component" from docs/12-cms-page-and-component-architecture.md §3.1:
 * an image or a video, each with independent desktop/mobile variants. Used wherever a
 * banner-style creative is needed (Banners' `creative`, Home's category tiles and Landers
 * Experience story cards).
 */
export const mediaField = (name: string, options: MediaFieldOptions = {}): Field => {
  const { required = false, mode = 'both' } = options

  const imageOnlyFields: Field[] = [
    { name: 'desktopImage', type: 'upload', relationTo: 'media', label: 'Desktop image' },
    { name: 'mobileImage', type: 'upload', relationTo: 'media', label: 'Mobile image' },
    {
      name: 'alt',
      type: 'text',
      label: 'Alt text',
      admin: { description: 'Accessibility text for the image.' },
    },
  ]

  const fields: Field[] =
    mode === 'imageOnly'
      ? imageOnlyFields
      : [
          {
            name: 'mediaType',
            type: 'select',
            defaultValue: 'image',
            options: [
              { label: 'Image', value: 'image' },
              { label: 'Video', value: 'video' },
            ],
          },
          {
            name: 'desktopImage',
            type: 'upload',
            relationTo: 'media',
            label: 'Desktop image',
            admin: { condition: isImage },
          },
          {
            name: 'mobileImage',
            type: 'upload',
            relationTo: 'media',
            label: 'Mobile image',
            admin: { condition: isImage },
          },
          {
            name: 'alt',
            type: 'text',
            label: 'Alt text',
            admin: { description: 'Accessibility text for the image.', condition: isImage },
          },
          {
            name: 'desktopVideo',
            type: 'upload',
            relationTo: 'media',
            label: 'Desktop video',
            admin: { condition: isVideo },
          },
          {
            name: 'mobileVideo',
            type: 'upload',
            relationTo: 'media',
            label: 'Mobile video',
            admin: { condition: isVideo },
          },
          {
            type: 'row',
            admin: { condition: isVideo },
            fields: [
              {
                name: 'controls',
                type: 'checkbox',
                defaultValue: true,
                label: 'Show player controls',
              },
              { name: 'autoplay', type: 'checkbox', defaultValue: false, label: 'Autoplay' },
            ],
          },
          {
            name: 'desktopPoster',
            type: 'upload',
            relationTo: 'media',
            label: 'Desktop poster image',
            admin: { condition: isVideo },
          },
          {
            name: 'mobilePoster',
            type: 'upload',
            relationTo: 'media',
            label: 'Mobile poster image',
            admin: { condition: isVideo },
          },
        ]

  return {
    name,
    type: 'group',
    label: 'Media',
    fields,
    ...(required ? { admin: { description: 'Required.' } } : {}),
  }
}
