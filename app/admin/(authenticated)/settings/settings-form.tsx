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
            Not currently in use — the site does not send notification emails
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
        {/* Kept, not deleted: the value is worth holding onto if notification
            emails come back. What it must not do is keep promising something
            that does not happen. */}
        <p className="text-xs leading-5 text-slate-400">
          Nothing is sent to these addresses at the moment. Enquiries reach you
          directly — the contact form opens the guest&rsquo;s email app and the
          booking rail opens WhatsApp — and every one is also listed under
          Inquiries. Saved here in case notification emails are switched on
          again.
        </p>
        <SubmitButton type="button" onClick={handleSave} loading={loading}>
          Save Settings
        </SubmitButton>
      </div>
    </div>
  );
}
