// app/api/admin/media/route.ts
//
// Receives one image and stores it. Exists for two reasons a Server Action
// cannot serve.
//
// PROGRESS. A Server Action travels over fetch, which has no upload progress
// events. Only XMLHttpRequest reports bytes sent, and it needs a plain endpoint
// to send them to. Without this, an admin uploading 47 MB over a hotel
// connection watches a spinner for six minutes with no way to tell a slow
// upload from a hung one.
//
// MEMORY. A Server Action has to buffer the whole body to hand over a File.
// Here the body is streamed to a temp file and sharp reads it back off disk, so
// the cost is flat no matter how large the upload: measured on a 100 MP
// photograph, 147 MB peak from a Buffer against 53 MB from a path.
//
// The body is the file itself, not multipart — XHR can send a File directly,
// which means no multipart parsing and one less copy in memory.
//
// AUTH IS THIS FILE'S OWN JOB. middleware.ts matches
// "/((?!api|_next/static|...).*)" — /api is excluded, deliberately, since that
// exclusion is also what lets this route past the 10 MB cap middleware imposes.
// Nothing upstream checks the session for this path. The check below is the only
// thing between the internet and an upload endpoint.

import { createWriteStream } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { storeImageFromPath, type StorageBucket } from "@/lib/storage";
import { MAX_UPLOAD_BYTES, uploadSizeError } from "@/lib/upload-limits";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKETS: StorageBucket[] = [
  "locations",
  "accommodations",
  "packages",
  "experiences",
  "activities",
  "images",
];

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.isLoggedIn) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const url = new URL(request.url);
  const bucket = url.searchParams.get("bucket") as StorageBucket | null;
  if (!bucket || !BUCKETS.includes(bucket)) {
    return NextResponse.json({ error: "Unknown destination." }, { status: 400 });
  }

  // One path segment, letters/digits/dash only: this becomes a directory name.
  const folderRaw = url.searchParams.get("folder");
  if (folderRaw && !/^[A-Za-z0-9_-]{1,64}$/.test(folderRaw)) {
    return NextResponse.json({ error: "Invalid folder." }, { status: 400 });
  }
  const folder = folderRaw ?? undefined;

  const name = decodeURIComponent(request.headers.get("x-filename") || "upload.jpg");

  // Content-Length is a claim, not a fact, so it is only used to refuse early
  // and save the caller a long upload. The real limit is enforced on the way in.
  const claimed = Number(request.headers.get("content-length") || 0);
  if (claimed) {
    const tooBig = uploadSizeError(name, claimed);
    if (tooBig) return NextResponse.json({ error: tooBig }, { status: 413 });
  }

  if (!request.body) {
    return NextResponse.json({ error: "No file received." }, { status: 400 });
  }

  const dir = await mkdtemp(path.join(tmpdir(), "island-hype-upload-"));
  const temp = path.join(dir, "incoming");

  try {
    let received = 0;
    // Counts as it goes and aborts the moment the real body passes the ceiling,
    // rather than writing 500 MB to /tmp and checking afterwards.
    const counter = new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        received += chunk.byteLength;
        if (received > MAX_UPLOAD_BYTES) {
          controller.error(new Error("TOO_LARGE"));
          return;
        }
        controller.enqueue(chunk);
      },
    });

    await pipeline(
      Readable.fromWeb(request.body.pipeThrough(counter) as never),
      createWriteStream(temp)
    );

    if (received === 0) {
      return NextResponse.json({ error: `${name} is empty.` }, { status: 400 });
    }

    const result = await storeImageFromPath(temp, { bucket, folder, originalName: name });
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      path: result.path,
      url: result.url,
      receivedBytes: received,
      storedBytes: result.storedBytes,
    });
  } catch (err) {
    if (err instanceof Error && err.message.includes("TOO_LARGE")) {
      return NextResponse.json(
        { error: uploadSizeError(name, MAX_UPLOAD_BYTES + 1) },
        { status: 413 }
      );
    }
    return NextResponse.json(
      { error: "The upload did not finish. Please try again." },
      { status: 500 }
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
