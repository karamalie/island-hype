// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained build artifact for low-RAM server deploys (build off-server, ship output).
  output: "standalone",

  images: {
    /**
     * The optimiser is ON, reversing an earlier decision. The reasoning it was
     * turned off for was sound at the time and no longer holds:
     *
     *   "runtime optimization is unwanted CPU/RAM load" — it is bounded load, not
     *   per-request load. Next resizes each (image, width) pair once, writes it to
     *   .next/cache/images, and serves from disk afterwards. With the TTL below
     *   that is roughly N images x 8 widths, ever.
     *
     *   "it would try to fetch the external media dir from its own origin (404)" —
     *   this was the real blocker and it is now fixed at the source. The optimiser
     *   fetches a local path through an internal mocked request to Next's own
     *   static handler, so the media has to sit under `public/`, not only behind
     *   nginx's alias. In production that is a symlink created by the deploy.
     *
     * What it replaces is a build-time derivative ladder whose manifest was
     * generated on a developer's machine — which meant photographs uploaded by
     * staff, in the media tree the script never saw, were served to phones at
     * full size and always would be.
     */

    /**
     * Ends at 3000 rather than Next's default 3840, matching the master cap in
     * lib/storage.ts. Nothing is stored wider than 3000px, and Next's optimiser
     * will happily enlarge to hit a requested width — which costs bytes and adds
     * no detail. 3000 still covers a 1440px laptop at 2x.
     */
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3000],

    /**
     * 30 days, not the 4-hour default. The optimiser's cache lifetime is
     * max(minimumCacheTTL, upstream max-age), and the upstream here is Next's own
     * static handler serving out of public/, which sends max-age=0 — so nginx's
     * 30-day header on /storage/ never reaches this calculation. Safe to set this
     * high because uploads get generated filenames: replacing an image produces a
     * new path rather than new bytes at the old one.
     */
    minimumCacheTTL: 2592000,

    /**
     * WebP only. AVIF compresses better and costs several times the CPU to
     * encode, which is not a trade this box should make.
     */
    formats: ["image/webp"],

    /** The allow-list. 82 for photography, 75 for everything else. */
    qualities: [75, 82],

    /** Media only. Keeps /_next/image from being pointed at arbitrary local paths. */
    localPatterns: [{ pathname: "/storage/**", search: "" }],
  },

  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],

    /**
     * 55mb against a 50 MB ceiling. The gap is for Server Action multipart
     * encoding overhead — a 50 MB file does not arrive as exactly 50 MB — so that
     * an oversized upload is refused by our own check in lib/upload-limits.ts,
     * with a sentence naming the file and its size, rather than by Next with
     * "Body exceeded 55 MB limit".
     *
     * The default is 1 MB, which is why every real photograph failed to upload.
     * nginx's client_max_body_size must stay at or above this.
     */
    serverActions: { bodySizeLimit: "55mb" },

    /**
     * The SECOND body gate, and the one that actually broke a 49 MB upload in
     * production after bodySizeLimit above was already raised.
     *
     * Next caps the body it will buffer for any request that passes through
     * middleware — "proxy" in 16 — at 10 MB by default, independently of the
     * Server Action limit. middleware.ts matches every non-asset path, so every
     * admin upload goes through it, and the multipart form was being cut off
     * mid-file:
     *
     *   Request body exceeded 10MB for /admin/accommodations/new.
     *   Only the first 10MB will be available unless configured.
     *   Error: Unexpected end of form
     *
     * Kept in step with bodySizeLimit and with nginx's client_max_body_size.
     * There are now four numbers gating an upload and they all have to agree;
     * lib/upload-limits.ts holds the one the user is told about.
     */
    proxyClientMaxBodySize: "55mb",
  },
};

export default nextConfig;
