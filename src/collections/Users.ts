import type { CollectionConfig } from 'payload'

import { authenticated, hasRoleField } from '../access'

/**
 * CMS users. The `role` options are the six admin roles the SoW names
 * (01-entities-and-parties.md): "Content Manager, CS Agent, Operations/Fulfilment,
 * Finance, IT/Engineering, Leadership -- RBAC-governed".
 *
 * The SoW never says whether those are Medusa roles, Payload roles, or both, and never maps
 * them to collection permissions. See docs/15-platform-capabilities.md §4 and
 * src/access/index.ts for the Payload-side policies built against this field.
 */
export const Users: CollectionConfig = {
  slug: 'users',
  admin: { useAsTitle: 'email', defaultColumns: ['email', 'role'] },
  auth: {
    // Phase 4 compares this against public read access for the BFF's own calls.
    useAPIKey: true,
    tokenExpiration: 60 * 60 * 24 * 30, // 30 days
  },
  access: {
    read: authenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'contentManager',
      // Read from the JWT rather than re-fetched per request -- every access check in
      // src/access/index.ts that branches on role depends on this.
      saveToJWT: true,
      options: [
        { label: 'Content Manager', value: 'contentManager' },
        { label: 'CS Agent', value: 'csAgent' },
        { label: 'Operations / Fulfilment', value: 'operations' },
        { label: 'Finance', value: 'finance' },
        { label: 'IT / Engineering', value: 'engineering' },
        { label: 'Leadership', value: 'leadership' },
      ],
      access: {
        // Only IT/Engineering can change anyone's role, including their own -- otherwise
        // any role could self-promote by editing their own user document.
        update: hasRoleField('engineering'),
      },
      admin: {
        description: 'The six admin roles named in the SoW. Only IT/Engineering can change this.',
      },
    },
  ],
}
