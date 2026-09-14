import type { Block, BlockSlug } from 'payload'
import { mediaField } from '../fields/media'

/**
 * The POC's four content components.
 *
 * These are registered ONCE in payload.config.ts's top-level `blocks` array, and every
 * collection that wants them references them by slug via `blockReferences`. That is the
 * first half of "author once, use everywhere": one *schema*, shared across collection
 * types. The second half -- one *content instance* shared across documents -- is the
 * ReusableContent block added in Phase 2.
 *
 * PAYLOAD v3 vs v4: in v3 a blocks field takes `blockReferences: ['slug']` PLUS an empty
 * `blocks: []` (required for compatibility). In v4 `blockReferences` is removed and the
 * slugs go directly into `blocks`. Every use site carries this note.
 */

export const Hero: Block = {
  slug: 'hero',
  interfaceName: 'HeroBlock',
  labels: { singular: 'Hero', plural: 'Heroes' },
  fields: [
    { name: 'heading', type: 'text', required: true },
    { name: 'subheading', type: 'textarea' },
    { name: 'image', type: 'upload', relationTo: 'media' },
    {
      name: 'alignment',
      type: 'select',
      defaultValue: 'left',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
      ],
    },
  ],
}

export const RichText: Block = {
  slug: 'richText',
  interfaceName: 'RichTextBlock',
  labels: { singular: 'Rich Text', plural: 'Rich Text' },
  fields: [{ name: 'content', type: 'richText', required: true }],
}

export const MediaBlock: Block = {
  slug: 'mediaBlock',
  interfaceName: 'MediaBlockType',
  labels: { singular: 'Media', plural: 'Media' },
  fields: [
    { name: 'media', type: 'upload', relationTo: 'media', required: true },
    { name: 'caption', type: 'text' },
  ],
}

export const Cta: Block = {
  slug: 'cta',
  interfaceName: 'CtaBlock',
  labels: { singular: 'Call to Action', plural: 'Calls to Action' },
  fields: [
    { name: 'heading', type: 'text', required: true },
    { name: 'body', type: 'textarea' },
    { name: 'label', type: 'text', required: true, label: 'Button label' },
    { name: 'href', type: 'text', required: true, label: 'Button URL' },
  ],
}

/**
 * A slot marker. It renders nothing itself -- it tells a page template WHERE a document's
 * own content belongs, so the common sections can sit both above and below it.
 *
 *   main  -> the document's own content field (a product's detail sections)
 *   extra -> the document's `templateOverrides`, for the one product that needs something
 *            the template does not provide
 *
 * Only ever placed inside a page-template's layout, never in a document.
 */
export const DocumentSlot: Block = {
  slug: 'documentSlot',
  interfaceName: 'DocumentSlotBlock',
  labels: { singular: 'Document Slot', plural: 'Document Slots' },
  fields: [
    {
      name: 'slot',
      type: 'select',
      required: true,
      defaultValue: 'main',
      options: [
        { label: "Main — the document's own content", value: 'main' },
        { label: 'Extra — per-document additions', value: 'extra' },
      ],
    },
  ],
}

/**
 * Structured zones for specific pages, beyond the four generic editorial blocks above.
 * Hero Carousel, Standalone Campaign Banner, Right Rail, and Footer Banner are NOT blocks
 * here — they're `Banners` placements or the `RightRail` Global (see collections/Banners.ts,
 * globals/RightRail.ts), resolved at render time independent of which page renders them.
 * Home and Cart are both ordinary `pages` documents (slugs `home`, `cart`) whose `layout`
 * contains whichever of these apply — not Globals, because both have a URL and need the
 * same SEO/versioning/preview story as any other page; only Header/Footer/SecondaryHeader/
 * BottomNav (true site-wide chrome with no page of their own) are Globals.
 */
export const ProductRail: Block = {
  slug: 'productRail',
  interfaceName: 'ProductRailBlock',
  labels: { singular: 'Product Rail', plural: 'Product Rails' },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: { description: 'e.g. "Grand Grocery Sale", "On Sale".' },
    },
    {
      name: 'medusaCollectionId',
      type: 'text',
      required: true,
      label: 'Medusa collection/category ID',
      admin: {
        description:
          'Products themselves are Medusa-driven — this only names the rail and which Medusa collection/category it pulls from.',
      },
    },
  ],
}

export const CategoryGrid: Block = {
  slug: 'categoryGrid',
  interfaceName: 'CategoryGridBlock',
  labels: { singular: 'Category Grid', plural: 'Category Grids' },
  fields: [
    {
      name: 'tiles',
      type: 'array',
      labels: { singular: 'Category Tile', plural: 'Category Tiles' },
      admin: { description: 'docs/10 §5.4 Category/Department Highlight Grid.' },
      fields: [
        mediaField('image', { required: true, mode: 'imageOnly' }),
        { name: 'tagline', type: 'text' },
        { name: 'slug', type: 'text', required: true },
        {
          name: 'medusaTargetId',
          type: 'text',
          required: true,
          label: 'Medusa category/collection ID',
        },
      ],
    },
  ],
}

export const LandersExperience: Block = {
  slug: 'landersExperience',
  interfaceName: 'LandersExperienceBlock',
  labels: { singular: 'Landers Experience', plural: 'Landers Experience' },
  fields: [
    {
      name: 'items',
      type: 'array',
      labels: { singular: 'Story Card', plural: 'Story Cards' },
      admin: { description: 'docs/10 §5.5 "Story Card" — image, title, video link.' },
      fields: [
        mediaField('image', { required: true, mode: 'imageOnly' }),
        { name: 'title', type: 'text', required: true },
        {
          name: 'videoLink',
          type: 'text',
          required: true,
          label: 'Video URL (YouTube embed or direct)',
        },
      ],
    },
  ],
}

/**
 * Cart's bottom-of-cart bestseller rails (final SoW p.128, F-100 1P / F-101 3P — see
 * docs/04-features-modules-and-scope.md § "Cart bestseller rails"). Deliberately NOT shaped
 * like `ProductRail`: F-100/F-101 rank by trailing-order-frequency via a scheduled Medusa
 * worker, not an editor-picked collection. Payload's only job is the worker's config
 * (window/frequency) and the manual pin override the SoW explicitly calls for — it never
 * decides or stores the ranking itself.
 */
export const CartBestsellerRail: Block = {
  slug: 'cartBestsellerRail',
  interfaceName: 'CartBestsellerRailBlock',
  labels: { singular: 'Cart Bestseller Rail', plural: 'Cart Bestseller Rails' },
  fields: [
    {
      name: 'scope',
      type: 'select',
      required: true,
      options: [
        { label: '1P (F-100)', value: '1p' },
        { label: '3P (F-101)', value: '3p' },
      ],
      admin: { description: 'Which SoW rail this is — ranking is computed separately per scope.' },
    },
    { name: 'title', type: 'text', required: true, admin: { description: 'e.g. "Bestsellers".' } },
    {
      type: 'row',
      fields: [
        {
          name: 'computationWindowDays',
          type: 'number',
          defaultValue: 90,
          label: 'Computation window (days)',
          admin: {
            width: '50%',
            description: 'Trailing order-frequency window the Medusa worker ranks over.',
          },
        },
        {
          name: 'updateFrequencyDays',
          type: 'number',
          defaultValue: 7,
          label: 'Update frequency (days)',
          admin: { width: '50%', description: 'How often the worker recomputes the ranking.' },
        },
      ],
    },
    {
      name: 'pinnedProducts',
      type: 'array',
      labels: { singular: 'Pinned Product', plural: 'Pinned Products' },
      admin: {
        description:
          'Manually pin specific SKUs ahead of the computed ranking, regardless of computed rank (F-100/F-101). Order here is pin order.',
      },
      fields: [
        { name: 'medusaProductId', type: 'text', required: true, label: 'Medusa product ID' },
      ],
    },
  ],
}

export const pageZoneBlocks: Block[] = [
  ProductRail,
  CategoryGrid,
  LandersExperience,
  CartBestsellerRail,
]

export const pageZoneBlockSlugs = [
  'productRail',
  'categoryGrid',
  'landersExperience',
  'cartBestsellerRail',
] satisfies BlockSlug[]

/**
 * The base content components. `reusableContent` is deliberately NOT in this list: it is
 * registered separately below, because the reusable-content collection's own `content`
 * field takes these four and must not be able to nest reusable content inside itself.
 */
export const contentBlocks: Block[] = [Hero, RichText, MediaBlock, Cta]

/**
 * The slugs, for `blockReferences`. Typed as BlockSlug[] rather than derived with
 * `.map(b => b.slug)` -- that widens to string[], which `blockReferences` rejects, because
 * Payload types it against the generated `Config['blocks']` keys. Keep in step with
 * `contentBlocks` above; the assertion below fails the typecheck if they diverge.
 */
export const contentBlockSlugs = ['hero', 'richText', 'mediaBlock', 'cta'] satisfies BlockSlug[]

// Compile-time guard: every registered block must appear in contentBlockSlugs.
const _slugCoverage: Record<(typeof contentBlocks)[number]['slug'], true> = Object.fromEntries(
  contentBlockSlugs.map((s) => [s, true]),
) as Record<(typeof contentBlocks)[number]['slug'], true>
void _slugCoverage

/**
 * What a document's layout can contain: the four components PLUS a reusable-content
 * placement. Registered at config root in payload.config.ts as
 * `[...contentBlocks, ReusableContentBlock]`.
 */
export const layoutBlockSlugs = [
  'hero',
  'richText',
  'mediaBlock',
  'cta',
  'reusableContent',
] satisfies BlockSlug[]

/**
 * What `pages` specifically can contain: everything an ordinary document can, plus Home's
 * and Cart's zone blocks. Scoped to `pages` alone (not `layoutBlockSlugs` itself, which
 * `product-content` and `page-templates` also use) so a PDP template can't offer "Category
 * Grid" or "Cart Bestseller Rail" as an option.
 */
export const pagesBlockSlugs = [...layoutBlockSlugs, ...pageZoneBlockSlugs] satisfies BlockSlug[]

/**
 * What a page template's layout can contain: everything a document can, plus the slot
 * marker that says where the document's own content goes.
 */
export const templateBlockSlugs = [...layoutBlockSlugs, 'documentSlot'] satisfies BlockSlug[]
