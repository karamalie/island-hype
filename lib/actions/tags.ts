"use server";

// lib/actions/tags.ts
//
// Create, rename, reorder and delete the filter categories.
//
// Until now these could only be *assigned* to a package; the list itself was
// fixed at seed time and the picker told staff to ask a developer. That is the
// wrong answer for a taxonomy the business owns — "Diving", "Honeymoon" and
// "Family" are commercial decisions, not schema.
//
// Two things here are deliberate and worth keeping:
//
//   The slug never changes after creation. It is the `?tag=` value in every
//   /packages URL, so re-slugging on rename would silently break any link
//   already shared, bookmarked or indexed. Staff rename the label they see;
//   the key underneath stays put.
//
//   Deleting is allowed even when packages use the category, because the
//   alternative — refusing until every package is untagged by hand — is worse.
//   PackageTag cascades, so the assignments go with it. The UI states the count
//   before the person confirms.

import { revalidatePath } from "next/cache";
import slugify from "slugify";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

type Result = { success: boolean; error?: string };

async function guard(): Promise<Result | null> {
  const session = await getSession();
  if (!session?.isLoggedIn) return { success: false, error: "Unauthorized" };
  return null;
}

/** Categories change what the public filter bar offers, so both pages refresh. */
function revalidate() {
  revalidatePath("/packages");
  revalidatePath("/admin/categories");
}

const MAX_NAME = 60; // matches @db.VarChar(60)

function cleanName(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

/**
 * Duplicate detection is done in JS rather than with a `where` clause, because
 * whether the database considers "diving" equal to "Diving" depends on the
 * column's collation — MySQL is usually case-insensitive, but relying on that
 * silently allows two filter buttons that look identical on the site if it ever
 * is not. There are a handful of categories, so comparing them here costs
 * nothing and does not care how the column is collated.
 */
async function findByName(name: string, exceptId?: string) {
  const wanted = name.toLowerCase();
  const all = await prisma.tag.findMany({ select: { id: true, name: true } });
  return (
    all.find((t) => t.id !== exceptId && t.name.toLowerCase() === wanted) ?? null
  );
}

/**
 * Slugs must be unique, and staff should not have to care. "Diving" when
 * "diving" exists becomes "diving-2" rather than an error they cannot act on.
 */
async function uniqueSlug(name: string): Promise<string> {
  const base = slugify(name, { lower: true, strict: true }) || "category";
  let candidate = base;
  let n = 2;
  // Bounded: a hundred collisions on one name is a data problem, not a retry.
  while (n < 100) {
    const taken = await prisma.tag.findUnique({ where: { slug: candidate } });
    if (!taken) return candidate;
    candidate = `${base}-${n}`;
    n++;
  }
  return `${base}-${Date.now()}`;
}

export async function createTag(name: string): Promise<Result & { id?: string }> {
  const bad = await guard();
  if (bad) return bad;

  const clean = cleanName(name);
  if (!clean) return { success: false, error: "Give the category a name first." };
  if (clean.length > MAX_NAME) {
    return {
      success: false,
      error: `That name is too long — keep it under ${MAX_NAME} characters so it fits on the filter button.`,
    };
  }

  const clash = await findByName(clean);
  if (clash) return { success: false, error: `“${clash.name}” already exists.` };

  try {
    const last = await prisma.tag.findFirst({ orderBy: { sortOrder: "desc" } });
    const created = await prisma.tag.create({
      data: {
        name: clean,
        slug: await uniqueSlug(clean),
        sortOrder: (last?.sortOrder ?? -1) + 1,
      },
    });
    revalidate();
    return { success: true, id: created.id };
  } catch {
    return { success: false, error: "That didn't save. Try again." };
  }
}

export async function renameTag(id: string, name: string): Promise<Result> {
  const bad = await guard();
  if (bad) return bad;

  const clean = cleanName(name);
  if (!clean) return { success: false, error: "A category needs a name." };
  if (clean.length > MAX_NAME) {
    return {
      success: false,
      error: `That name is too long — keep it under ${MAX_NAME} characters.`,
    };
  }

  const clash = await findByName(clean, id);
  if (clash) return { success: false, error: `“${clash.name}” already exists.` };

  try {
    // Note: slug untouched on purpose. See the header.
    await prisma.tag.update({ where: { id }, data: { name: clean } });
    revalidate();
    return { success: true };
  } catch {
    return { success: false, error: "That didn't save. Try again." };
  }
}

/** Array order becomes sortOrder, which is the order of the filter buttons. */
export async function reorderTags(ids: string[]): Promise<Result> {
  const bad = await guard();
  if (bad) return bad;

  try {
    await prisma.$transaction(
      ids.map((id, i) =>
        prisma.tag.update({ where: { id }, data: { sortOrder: i } })
      )
    );
    revalidate();
    return { success: true };
  } catch {
    return { success: false, error: "The new order didn't save. Try again." };
  }
}

export async function deleteTag(id: string): Promise<Result> {
  const bad = await guard();
  if (bad) return bad;

  try {
    // PackageTag cascades, so this also removes the category from every package
    // that used it. The confirmation dialog says how many that is.
    await prisma.tag.delete({ where: { id } });
    revalidate();
    return { success: true };
  } catch {
    return { success: false, error: "That didn't delete. Try again." };
  }
}
