import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { contentBlocks, DocumentSlot, pageZoneBlocks } from './blocks'
import { ReusableContentBlock } from './blocks/ReusableContent/config'
import { Banners } from './collections/Banners'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { PageTemplates } from './collections/PageTemplates'
import { ProductContent } from './collections/ProductContent'
import { ReusableContent } from './collections/ReusableContent'
import { Sales } from './collections/Sales'
import { Users } from './collections/Users'
import { bffProductContent } from './endpoints/bff'
import { seedEndpoint } from './endpoints/seed'
import { BottomNav } from './globals/BottomNav'
import { Footer } from './globals/Footer'
import { Header } from './globals/Header'
import { RightRail } from './globals/RightRail'
import { SecondaryHeader } from './globals/SecondaryHeader'
import { plugins } from './plugins'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: ' — Snapmart CMS' },
  },

  // Every shared content component is defined ONCE, here. Collections reference them by
  // slug rather than redeclaring them, which is the config-level half of "author once,
  // use everywhere". See src/blocks/index.ts for the v3-vs-v4 API note.
  blocks: [...contentBlocks, ...pageZoneBlocks, ReusableContentBlock, DocumentSlot],

  collections: [
    Pages,
    ProductContent,
    ReusableContent,
    PageTemplates,
    Banners,
    Sales,
    Media,
    Users,
  ],

  // True site-wide chrome, with no page of its own — Header/Footer/SecondaryHeader/
  // BottomNav are Globals. Home and Cart are NOT: both have a URL and need the same
  // SEO/versioning/preview story as any other page, so each is an ordinary `pages` document
  // (slugs `home`, `cart`) whose zone blocks (`pageZoneBlocks`, registered above) live in
  // `Pages.layout` like every other page's content. Sticky Sale Bar, Hero Carousel,
  // Standalone Campaign Banner, and PLP/Category banner are NOT globals, fields, or blocks
  // anywhere — they're `Banners` placements (see collections/Banners.ts), because a banner
  // declaring where it shows is the only shape that also works for PLP, which is a Medusa
  // category/collection, not a Payload document. Two exceptions: Right Rail IS a Global (an
  // ordered list of Banner references) rather than a placement, because unlike PLP there's
  // one site-wide list the content team explicitly curates and orders, not a tag-and-pull
  // query — see globals/RightRail.ts. And the Footer's "Download the App" banner is a field
  // on the Footer Global itself, not a Banners document at all — see globals/Footer.ts.
  globals: [Header, SecondaryHeader, Footer, BottomNav, RightRail],

  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL || '' },
  }),
  endpoints: [seedEndpoint, bffProductContent],
  sharp,
  plugins,
  jobs: {
    autoRun: [{ cron: '* * * * *' }], // Payload's own default: check every minute
  },
})
