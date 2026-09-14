import type { Access, FieldAccess } from 'payload'
import type { User } from '../payload-types'

/** Public read. The BFF (snapmart-frontend ADR 0006) calls Payload unauthenticated. */
export const anyone: Access = () => true

/** Any logged-in CMS user. */
export const authenticated: Access = ({ req: { user } }) => Boolean(user)

/**
 * Logged-in users see everything; the public sees published documents only.
 * This is what makes drafts safe to expose on a public endpoint.
 */
export const authenticatedOrPublished: Access = ({ req: { user } }) => {
  if (user) return true
  return { _status: { equals: 'published' } }
}

export const authenticatedFieldAccess: FieldAccess = ({ req: { user } }) => Boolean(user)

/**
 * Role-based access control (docs/15-platform-capabilities.md §4).
 *
 * Payload has no packaged roles system -- this is the function-based pattern its own docs
 * recommend: a `role` field on `Users` (saveToJWT so a check never needs a DB round trip),
 * plus `Access` functions here that branch on it.
 *
 * Only the roles that actually reach into Payload get a named policy. CS Agent, Operations,
 * Finance, and Leadership are almost entirely Medusa-side per the SoW's role table (final
 * SoW p.152) -- customer/order data, financial reporting -- so within Payload they default
 * to `isReadOnlyAdmin` rather than each getting a bespoke policy for content they were never
 * described as writing.
 */

const userHasRole = (
  user: { role: User['role'] } | null | undefined,
  roles: User['role'][],
): boolean => Boolean(user?.role && roles.includes(user.role))

/** True if the logged-in user's role is one of the given roles. Logged out is always false. */
export const hasRole =
  (...roles: User['role'][]): Access =>
  ({ req: { user } }) =>
    userHasRole(user, roles)

/** Field-level equivalent of `hasRole`, for a field's own `access.update`/`access.read`. */
export const hasRoleField =
  (...roles: User['role'][]): FieldAccess =>
  ({ req: { user } }) =>
    userHasRole(user, roles)

/**
 * Content Manager and IT/Engineering can create and edit CMS content -- pages, banners,
 * global chrome, templates. Every other role is read-only here (see `isReadOnlyAdmin`).
 */
export const canEditContent: Access = hasRole('contentManager', 'engineering')

/**
 * CS Agent, Operations, Finance, and Leadership: logged in, can read, cannot write. None of
 * the SoW's descriptions of these four roles (final SoW p.152) has them authoring CMS
 * content -- defaulting them to read-only here, rather than silently inheriting write access
 * from `authenticated`, is what makes an omission fail closed instead of open.
 */
export const isReadOnlyAdmin: Access = hasRole('csAgent', 'operations', 'finance', 'leadership')
