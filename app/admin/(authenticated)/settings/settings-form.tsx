"use client";

import { useState } from "react";
import { toast } from "sonner";
import { SubmitButton } from "@/components/admin/ui/submit-button";
import { updateSetting } from "@/lib/actions/settings";
import { Mail } from "lucide-react";

interface SettingsFormProps {
  initialEmails: string;
}

export function SettingsForm({ initialEmails }: SettingsFormProps) {
  const [emails, setEmails] = useState(initialEmails);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    const result = await updateSetting("notification_emails", emails);
    setLoading(false);
    if (result.success) {
      toast.success("Settings saved");
    } else {
      toast.error(result.error || "Failed to save");
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
          <Mail className="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Notification Emails
          </h2>
          <p className="text-xs text-slate-500">
            Email addresses that receive inquiry notifications
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <textarea
          value={emails}
          onChange={(e) => setEmails(e.target.value)}
          rows={3}
          placeholder="email1@example.com, email2@example.com"
          className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors resize-y"
        />
        <p className="text-xs text-slate-400">
          Separate multiple emails with commas. These addresses will receive
          notifications when new inquiries or bookings are submitted.
        </p>
        <SubmitButton type="button" onClick={handleSave} loading={loading}>
          Save Settings
        </SubmitButton>
      </div>
    </div>
  );
}
