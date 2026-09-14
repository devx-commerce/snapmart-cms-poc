import type { Field } from 'payload'

interface LinkFieldOptions {
  required?: boolean
}

/**
 * The reusable "Link component" from docs/12-cms-page-and-component-architecture.md §3.2:
 * a destination URL plus a same-window/new-window target.
 */
export const linkField = (name: string, options: LinkFieldOptions = {}): Field => {
  const { required = false } = options

  return {
    name,
    type: 'group',
    label: 'Link',
    fields: [
      { name: 'url', type: 'text', required, label: 'Destination URL' },
      {
        name: 'target',
        type: 'select',
        defaultValue: 'same',
        options: [
          { label: 'Same window', value: 'same' },
          { label: 'New window', value: 'new' },
        ],
      },
    ],
  }
}
