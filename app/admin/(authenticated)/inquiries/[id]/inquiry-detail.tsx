"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BackButton } from "@/components/admin/ui/back-button";
import { StatusBadge } from "@/components/admin/ui/status-badge";
import { SubmitButton } from "@/components/admin/ui/submit-button";
import {
  updateInquiryStatus,
  addInquiryNote,
} from "@/lib/actions/inquiries";
import {
  Mail,
  Phone,
  Globe,
  Calendar,
  Users,
  Plane,
  Package,
} from "lucide-react";

interface InquiryDetailProps {
  inquiry: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    nationality?: string | null;
    packageId?: string | null;
    packageName?: string | null;
    package?: { id: string; name: string; slug: string } | null;
    checkIn?: string | null;
    checkOut?: string | null;
    adults: number;
    children: number;
    infants: number;
    message: string;
    specialRequests?: string | null;
    arrivalFlight?: string | null;
    departureFlight?: string | null;
    market: string;
    estimatedPriceUSD?: number | null;
    estimatedPriceMVR?: number | null;
    status: string;
    notes?: string | null;
    respondedAt?: string | null;
    respondedBy?: string | null;
    createdAt: string;
  };
}

const statuses = [
  "NEW",
  "CONTACTED",
  "NEGOTIATING",
  "BOOKED",
  "CANCELLED",
  "CLOSED",
];

export function InquiryDetail({ inquiry }: InquiryDetailProps) {
  const router = useRouter();
  const [status, setStatus] = useState(inquiry.status);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [noteLoading, setNoteLoading] = useState(false);
  const [currentNotes, setCurrentNotes] = useState(inquiry.notes || "");

  async function handleStatusUpdate() {
    setLoading(true);
    const result = await updateInquiryStatus(inquiry.id, status);
    setLoading(false);
    if (result.success) {
      toast.success("Status updated");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to update status");
    }
  }

  async function handleAddNote() {
    if (!note.trim()) return;
    setNoteLoading(true);
    const result = await addInquiryNote(inquiry.id, note);
    setNoteLoading(false);
    if (result.success) {
      toast.success("Note added");
      setCurrentNotes(
        currentNotes
          ? `${currentNotes}\n\n---\n\n${note}`
          : note
      );
      setNote("");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to add note");
    }
  }

  const inputClass =
    "w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors";

  return (
    <div>
      <BackButton href="/admin/inquiries" label="Back to Inquiries" />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{inquiry.name}</h1>
          <p className="text-sm text-slate-500 mt-1">
            Submitted {new Date(inquiry.createdAt).toLocaleDateString()} at{" "}
            {new Date(inquiry.createdAt).toLocaleTimeString()}
          </p>
        </div>
        <StatusBadge status={inquiry.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Info */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-sm font-semibold text-slate-900 mb-4">
              Contact Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow icon={Mail} label="Email" value={inquiry.email} />
              {inquiry.phone && (
                <InfoRow icon={Phone} label="Phone" value={inquiry.phone} />
              )}
              {inquiry.nationality && (
                <InfoRow
                  icon={Globe}
                  label="Nationality"
                  value={inquiry.nationality}
                />
              )}
              <InfoRow
                icon={Globe}
                label="Market"
                value={inquiry.market}
              />
            </div>
          </div>

          {/* Booking Details */}
          {inquiry.packageName && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-sm font-semibold text-slate-900 mb-4">
                Booking Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoRow
                  icon={Package}
                  label="Package"
                  value={inquiry.packageName}
                />
                {inquiry.checkIn && (
                  <InfoRow
                    icon={Calendar}
                    label="Check-in"
                    value={new Date(inquiry.checkIn).toLocaleDateString()}
                  />
                )}
                {inquiry.checkOut && (
                  <InfoRow
                    icon={Calendar}
                    label="Check-out"
                    value={new Date(inquiry.checkOut).toLocaleDateString()}
                  />
                )}
                <InfoRow
                  icon={Users}
                  label="Guests"
                  value={`${inquiry.adults}A ${inquiry.children}C ${inquiry.infants}I`}
                />
                {inquiry.arrivalFlight && (
                  <InfoRow
                    icon={Plane}
                    label="Arrival"
                    value={inquiry.arrivalFlight}
                  />
                )}
                {inquiry.departureFlight && (
                  <InfoRow
                    icon={Plane}
                    label="Departure"
                    value={inquiry.departureFlight}
                  />
                )}
              </div>
              {(inquiry.estimatedPriceUSD || inquiry.estimatedPriceMVR) && (
                <div className="mt-4 pt-4 border-t border-slate-100 text-sm text-slate-600">
                  Estimated:{" "}
                  {inquiry.estimatedPriceUSD && `$${inquiry.estimatedPriceUSD}`}
                  {inquiry.estimatedPriceUSD && inquiry.estimatedPriceMVR && " / "}
                  {inquiry.estimatedPriceMVR &&
                    `MVR ${inquiry.estimatedPriceMVR}`}
                </div>
              )}
            </div>
          )}

          {/* Message */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">
              Message
            </h2>
            <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
              {inquiry.message}
            </p>
          </div>

          {/* Special Requests */}
          {inquiry.specialRequests && (
            <div className="bg-amber-50 rounded-xl border border-amber-200 p-6">
              <h2 className="text-sm font-semibold text-amber-900 mb-3">
                Special Requests
              </h2>
              <p className="text-sm text-amber-800 whitespace-pre-wrap leading-relaxed">
                {inquiry.specialRequests}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Update */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-sm font-semibold text-slate-900 mb-4">
              Update Status
            </h2>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={inputClass}
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <SubmitButton
              type="button"
              onClick={handleStatusUpdate}
              loading={loading}
              className="w-full mt-3"
              disabled={status === inquiry.status}
            >
              Update Status
            </SubmitButton>
            {inquiry.respondedAt && (
              <p className="text-xs text-slate-400 mt-3">
                Last responded:{" "}
                {new Date(inquiry.respondedAt).toLocaleDateString()}
                {inquiry.respondedBy && ` by ${inquiry.respondedBy}`}
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-sm font-semibold text-slate-900 mb-4">
              Internal Notes
            </h2>
            {currentNotes && (
              <div className="bg-slate-50 rounded-lg p-3 mb-4 text-sm text-slate-700 whitespace-pre-wrap max-h-60 overflow-y-auto">
                {currentNotes}
              </div>
            )}
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note..."
              rows={3}
              className={`${inputClass} resize-y`}
            />
            <SubmitButton
              type="button"
              onClick={handleAddNote}
              loading={noteLoading}
              variant="outline"
              className="w-full mt-3"
              disabled={!note.trim()}
            >
              Add Note
            </SubmitButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm text-slate-900">{value}</p>
      </div>
    </div>
  );
}
