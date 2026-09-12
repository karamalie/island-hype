// components/admin/ui/table-empty.tsx
//
// The row a list screen shows when it has nothing to list.
//
// Every admin list had a variant of "No packages found. Create your first one."
// — one thin grey line, no button, and "found" phrased as though a search had
// failed. For someone who is not a developer, an empty screen is the moment they
// most need telling what this list is for and what the next action is, and that
// sentence gave them neither.
//
// So each one now says three things: that the list is empty, what the records in
// it actually do on the public site, and the one button that starts the job. The
// consequence line is the part that matters — "a package with no activities
// simply hides that section" is the kind of thing nobody can infer from an empty
// table, and not knowing it is what makes people afraid to touch the panel.

import Link from "next/link";
import { Inbox, Plus } from "lucide-react";

export function TableEmptyRow({
  colSpan,
  title,
  body,
  action,
}: {
  colSpan: number;
  title: string;
  body: string;
  /** Omitted where the person cannot create the record — enquiries arrive. */
  action?: { label: string; href: string };
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-14">
        <div className="mx-auto max-w-md text-center">
          <span className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
            {action ? (
              <Plus className="h-5 w-5 text-slate-400" />
            ) : (
              <Inbox className="h-5 w-5 text-slate-400" />
            )}
          </span>
          <p className="m-0 text-sm font-medium text-slate-900">{title}</p>
          <p className="mx-auto mt-1.5 max-w-[48ch] text-sm leading-6 text-slate-500">
            {body}
          </p>
          {action && (
            <Link
              href={action.href}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              {action.label}
            </Link>
          )}
        </div>
      </td>
    </tr>
  );
}
