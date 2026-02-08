import { prisma } from "@/lib/prisma";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const notificationEmails = await prisma.siteSetting
    .findUnique({ where: { key: "notification_emails" } })
    .then((s) => s?.value || "");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure your Island Hype admin panel
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        <SettingsForm initialEmails={notificationEmails} />
      </div>
    </div>
  );
}
