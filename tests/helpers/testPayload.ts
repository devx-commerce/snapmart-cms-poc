import { getPayload, type Payload } from 'payload'
import config from '../../src/payload.config.js'

let cached: Promise<Payload> | undefined

/**
 * A memoized Payload instance for a single spec file. Payload's local-dev schema sync
 * ("push") isn't safely re-entrant -- two `getPayload()` calls in quick succession against
 * the same Postgres database can each try to drop a constraint the other already dropped
 * and recreated under a different auto-generated name, failing with "constraint ... does
 * not exist" even when the target schema is identical. Memoizing here means a file with
 * several `describe` blocks only pays that cost once.
 *
 * Known limitation: each spec file still gets its own module instance of this cache (Vitest
 * does not share module state across files even with `isolate: false` in this project's
 * setup), so running multiple `*.int.spec.ts` files in the same `pnpm test:int` invocation
 * can still hit the race above. Until this project adopts `payload migrate` in place of dev
 * push (see Payload's own postgres-adapter docs on `push: false`), run new integration spec
 * files one at a time if `pnpm test:int` reports a "constraint ... does not exist" error.
 */
export function getTestPayload(): Promise<Payload> {
  if (!cached) {
    cached = (async () => {
      const payloadConfig = await config
      return getPayload({ config: payloadConfig })
    })()
  }
  return cached
}
