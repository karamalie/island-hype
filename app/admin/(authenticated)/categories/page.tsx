// app/admin/(authenticated)/categories/page.tsx
//
// Manage the filter categories themselves, rather than only assigning them.
//
// The package editor's category tab ticks boxes against this list; this page is
// where the list comes from. The live package count is passed through so the
// page can say whether the filter bar is showing on the site at all — a staff
// member editing categories cannot otherwise tell, because the bar only appears
// at six or more live packages.

import { PageHeader } from "@/components/admin/ui/page-header";
import { CategoryManager } from "@/components/admin/editors/category-manager";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const [tags, livePackageCount] = await Promise.all([
    // The live count per tag is fetched rather than derived from _count, because
    // the public filter bar only lists a tag that a LIVE package uses — see
    // getPackageFilterOptions. A tag used only by deactivated packages is
    // invisible on the site, and the row has to be able to say so.
    prisma.tag.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: {
        packages: { select: { package: { select: { isActive: true } } } },
      },
    }),
    prisma.package.count({ where: { isActive: true } }),
  ]);

  return (
    <div>
      <PageHeader
        title="Filter categories"
        description="The buttons guests use to narrow the package list."
      />
      <CategoryManager
        livePackageCount={livePackageCount}
        initial={tags.map((t) => ({
          id: t.id,
          name: t.name,
          slug: t.slug,
          packageCount: t.packages.length,
          livePackageCount: t.packages.filter((p) => p.package.isActive).length,
        }))}
      />
    </div>
  );
}
