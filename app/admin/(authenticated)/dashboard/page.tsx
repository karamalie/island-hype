import { prisma } from "@/lib/prisma";

async function getDashboardStats() {
  const [
    totalPackages,
    activePackages,
    totalLocations,
    totalAccommodations,
    totalExperiences,
    totalActivities,
    totalOffers,
    totalInquiries,
    newInquiries,
    recentInquiries,
  ] = await Promise.all([
    prisma.package.count(),
    prisma.package.count({ where: { isActive: true } }),
    prisma.location.count(),
    prisma.accommodation.count(),
    prisma.experience.count(),
    prisma.activity.count(),
    prisma.offer.count({ where: { isActive: true } }),
    prisma.inquiry.count(),
    prisma.inquiry.count({
      where: {
        status: "NEW",
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.inquiry.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        market: true,
        packageName: true,
        createdAt: true,
      },
    }),
  ]);

  return {
    totalPackages,
    activePackages,
    totalLocations,
    totalAccommodations,
    totalExperiences,
    totalActivities,
    totalOffers,
    totalInquiries,
    newInquiries,
    recentInquiries,
  };
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  const statCards = [
    {
      label: "Active Packages",
      value: stats.activePackages,
      total: stats.totalPackages,
      color: "bg-blue-500",
    },
    {
      label: "Locations",
      value: stats.totalLocations,
      color: "bg-emerald-500",
    },
    {
      label: "Accommodations",
      value: stats.totalAccommodations,
      color: "bg-violet-500",
    },
    {
      label: "New Inquiries (7d)",
      value: stats.newInquiries,
      total: stats.totalInquiries,
      color: "bg-amber-500",
    },
    {
      label: "Experiences",
      value: stats.totalExperiences,
      color: "bg-cyan-500",
    },
    {
      label: "Activities",
      value: stats.totalActivities,
      color: "bg-rose-500",
    },
    {
      label: "Active Offers",
      value: stats.totalOffers,
      color: "bg-orange-500",
    },
  ];

  const statusColors: Record<string, string> = {
    NEW: "bg-blue-100 text-blue-700",
    CONTACTED: "bg-yellow-100 text-yellow-700",
    NEGOTIATING: "bg-purple-100 text-purple-700",
    BOOKED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
    CLOSED: "bg-slate-100 text-slate-700",
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Overview of your Island Hype content
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl border border-slate-200 p-4"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-2 h-2 rounded-full ${card.color}`} />
              <span className="text-xs font-medium text-slate-500">
                {card.label}
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-slate-900">
                {card.value}
              </span>
              {card.total !== undefined && (
                <span className="text-sm text-slate-400">/ {card.total}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Inquiries */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">
            Recent Inquiries
          </h2>
        </div>
        {stats.recentInquiries.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-slate-400">
            No inquiries yet
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {stats.recentInquiries.map((inquiry) => (
              <div
                key={inquiry.id}
                className="px-5 py-3 flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {inquiry.name}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {inquiry.packageName || "General inquiry"} &middot;{" "}
                    {inquiry.email}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      statusColors[inquiry.status] || statusColors.NEW
                    }`}
                  >
                    {inquiry.status}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(inquiry.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
