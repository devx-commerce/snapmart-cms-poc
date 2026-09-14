import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { getTestPayload } from '../helpers/testPayload'

let payload: Payload

const CONTENT_MANAGER_EMAIL = 'rbac-test-content-manager@snapmart.test'
const FINANCE_EMAIL = 'rbac-test-finance@snapmart.test'

describe('Role-based access control — Banners', () => {
  beforeAll(async () => {
    payload = await getTestPayload()

    await payload.create({
      collection: 'users',
      data: { email: CONTENT_MANAGER_EMAIL, password: 'test-pass-123', role: 'contentManager' },
    })
    await payload.create({
      collection: 'users',
      data: { email: FINANCE_EMAIL, password: 'test-pass-123', role: 'finance' },
    })
  })

  afterAll(async () => {
    await payload.delete({ collection: 'banners', where: { internalTitle: { like: 'RBAC test' } } })
    await payload.delete({
      collection: 'users',
      where: { email: { in: [CONTENT_MANAGER_EMAIL, FINANCE_EMAIL] } },
    })
  })

  it('lets a Content Manager create a banner', async () => {
    const { docs } = await payload.find({
      collection: 'users',
      where: { email: { equals: CONTENT_MANAGER_EMAIL } },
    })

    const banner = await payload.create({
      collection: 'banners',
      data: {
        internalTitle: 'RBAC test — content manager',
        placements: [{ surface: 'home-hero' }],
      },
      user: docs[0],
      overrideAccess: false,
    })

    expect(banner.internalTitle).toBe('RBAC test — content manager')
  })

  it('blocks a Finance user from creating a banner', async () => {
    const { docs } = await payload.find({
      collection: 'users',
      where: { email: { equals: FINANCE_EMAIL } },
    })

    await expect(
      payload.create({
        collection: 'banners',
        data: {
          internalTitle: 'RBAC test — finance (should not exist)',
          placements: [{ surface: 'home-hero' }],
        },
        user: docs[0],
        overrideAccess: false,
      }),
    ).rejects.toThrow()
  })
})
