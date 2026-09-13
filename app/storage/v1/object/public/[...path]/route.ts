// app/storage/v1/object/public/[...path]/route.ts
//
// Serves a file out of the media tree, for the image optimiser's benefit.
//
// Browsers never reach this in production: nginx has a `location
// /storage/v1/object/public/` alias and answers first, which is faster and what
// should keep happening. This route exists for the ONE caller that cannot go
// through nginx — Next's own image optimiser.
//
// The optimiser resolves a local `url` by replaying it as an internal mocked
// request through Next's router (`fetchInternalImage`). That means the file has
// to be servable BY NEXT, not merely present on disk. And Next's static handler
// cannot serve a file it has not heard of: it builds `publicFolderItems` once at
// startup from a single recursiveReadDir (server/lib/router-utils/filesystem.js)
// and never rescans.
//
// So a photograph uploaded through admin was servable by nginx immediately and
// invisible to the optimiser until the next deploy — which would have rendered
// it BROKEN rather than merely unoptimised, because PhotoFrame's srcset offers
// only /_next/image candidates and every one of them 400s. Verified on
// production: a file copied into the media tree answered 200 through nginx and
// 400 through the optimiser in the same second.
//
// A route handler runs per request and touches the filesystem each time, so it
// has no such horizon. Files that did exist at boot are still served by the
// static handler ahead of this route; this catches everything added since.

import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const MEDIA_ROOT =
  process.env.MEDIA_ROOT ||
  path.join(process.cwd(), "public", "storage", "v1", "object", "public");

/** Only what the pipeline stores, plus the legacy files already in the tree. */
const TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;

  const type = TYPES[path.extname(segments.at(-1) ?? "").toLowerCase()];
  if (!type) return new NextResponse("Not found", { status: 404 });

  // Traversal guard. Segments arrive decoded, so "..", encoded or not, has to be
  // rejected here rather than trusted to the URL parser.
  const target = path.resolve(MEDIA_ROOT, ...segments);
  const root = path.resolve(MEDIA_ROOT);
  if (target !== root && !target.startsWith(root + path.sep)) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const info = await stat(target);
    if (!info.isFile()) return new NextResponse("Not found", { status: 404 });

    const body = await readFile(target);
    return new NextResponse(new Uint8Array(body), {
      headers: {
        "Content-Type": type,
        // Matches what nginx sends for the same file, so the two paths agree and
        // the optimiser derives the same cache lifetime either way.
        "Cache-Control": "public, max-age=2592000",
        ETag: `"${createHash("sha1").update(`${info.size}-${info.mtimeMs}`).digest("hex")}"`,
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
