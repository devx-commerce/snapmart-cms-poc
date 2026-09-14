import type { Payload } from 'payload'
import { beforeAll, describe, expect, it } from 'vitest'
import { getTestPayload } from '../helpers/testPayload'

let payload: Payload

describe('API', () => {
  beforeAll(async () => {
    payload = await getTestPayload()
  })

  it('fetches users', async () => {
    const users = await payload.find({
      collection: 'users',
    })
    expect(users).toBeDefined()
  })
})
