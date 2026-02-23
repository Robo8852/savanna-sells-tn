// ============================================================================
// ADMIN LEADS PAGE — Where Savanna manages people who filled out the contact form
// ============================================================================
//
// This is the /admin/leads page. It shows a table of every person ("lead") who
// submitted the contact form on the public site. Savanna can:
//
//   1. Filter by status — click tabs at the top to see only "new" or "contacted" leads, etc.
//   2. Change a lead's status — use the dropdown right in the table row (no save button needed)
//   3. Expand a row — click any row to reveal extra details like their message or preferred showing time
//
// HOW THE DATA FLOWS:
//   - useQuery(api.leads.getAll) opens a live connection to Convex.
//     Whenever a new lead is submitted or a status changes, the table
//     updates automatically — no page refresh needed.
//   - useMutation(api.leads.updateStatus) sends the new status to the database
//     the instant Savanna picks a new option from the dropdown.
//
// KEY CONCEPTS IN THIS FILE:
//   useState    = A way to store temporary values that the page remembers between renders.
//                 We use it for: which filter tab is active, and which row is expanded.
//   Fragment    = An invisible wrapper. We need two <tr> elements per lead (the main row
//                 + the expanded details row), but React requires one wrapper per item.
//                 A <div> would break the table, so Fragment wraps them invisibly.
//   stopPropagation = "Don't let this click bubble up." When Savanna clicks the status
//                 dropdown or a listing link, we don't want the row to also expand/collapse.
// ============================================================================

"use client";

import { Fragment, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";

// ─── TYPES ───
// TypeScript type that lists the only 4 valid lead statuses.
// If you try to use a status that's not in this list, TypeScript
// will underline it in red before you even run the code.
type LeadStatus = "new" | "contacted" | "scheduled" | "closed";

// ─── STATUS STYLES ───
// A lookup table: give it a status like "new", and it gives back the
// Tailwind CSS classes to make the badge that color.
//   new       → blue
//   contacted → amber/yellow
//   scheduled → green
//   closed    → gray
const STATUS_STYLES: Record<LeadStatus, string> = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-amber-100 text-amber-700",
  scheduled: "bg-emerald-100 text-emerald-700",
  closed: "bg-gray-100 text-gray-500",
};

// Same idea but for display names. The database stores "new" (lowercase),
// but we show "New" (capitalized) to the user.
const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  scheduled: "Scheduled",
  closed: "Closed",
};

// A simple list of all 4 statuses, used to build dropdown options.
const ALL_STATUSES: LeadStatus[] = ["new", "contacted", "scheduled", "closed"];

// ============================================================================
// FILTER TABS — The row of buttons at the top of the page
// ============================================================================
// Shows: All | New | Contacted | Scheduled | Closed
// Each button shows a count (e.g. "New 3") so Savanna can see at a glance
// how many leads are in each bucket.
//
// Props (the inputs this component receives):
//   active   = which tab is currently selected
//   onChange = a function to call when Savanna clicks a different tab
//   counts   = an object like { all: 10, new: 3, contacted: 4, ... }

function FilterTabs({
  active,
  onChange,
  counts,
}: {
  active: LeadStatus | "all";
  onChange: (filter: LeadStatus | "all") => void;
  counts: Record<LeadStatus | "all", number>;
}) {
  // The list of tabs to render. Each has a key (the filter value)
  // and a label (what the button says).
  const tabs: { key: LeadStatus | "all"; label: string }[] = [
    { key: "all", label: "All" },
    { key: "new", label: "New" },
    { key: "contacted", label: "Contacted" },
    { key: "scheduled", label: "Scheduled" },
    { key: "closed", label: "Closed" },
  ];

  return (
    <div className="flex gap-2">
      {/* Loop through each tab and render a button */}
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          // If this tab is active → green background (bg-accent).
          // If not → white background, turns gray on hover.
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            active === tab.key
              ? "bg-accent text-white"
              : "bg-white text-primary/60 hover:bg-secondary hover:text-primary"
          }`}
        >
          {tab.label}
          {/* The count number next to the label, e.g. "New 3" */}
          <span
            className={`ml-1.5 text-xs ${
              active === tab.key ? "text-white/70" : "text-primary/40"
            }`}
          >
            {counts[tab.key]}
          </span>
        </button>
      ))}
    </div>
  );
}

// ============================================================================
// STATUS DROPDOWN — The inline dropdown in each table row
// ============================================================================
// Looks like a colored badge, but it's actually a <select> dropdown.
// When Savanna picks a different status, it saves to the database instantly.
//
// Props:
//   leadId        = the database ID of this lead (so we know which row to update)
//   currentStatus = what the status is right now (so we can pre-select it)
//
// HOW IT WORKS:
//   1. Savanna clicks the badge → a dropdown appears with all 4 statuses
//   2. She picks a new one (e.g. "Contacted")
//   3. handleChange fires → calls updateStatus mutation → Convex saves it
//   4. The useQuery subscription on the parent page detects the change
//   5. The whole table re-renders with the updated status — automatically

function StatusDropdown({
  leadId,
  currentStatus,
}: {
  leadId: Id<"leads">;
  currentStatus: LeadStatus;
}) {
  // Connect to the updateStatus mutation defined in convex/leads.ts
  const updateStatus = useMutation(api.leads.updateStatus);

  // Called every time Savanna picks a new option from the dropdown.
  // e.target.value = the value of the <option> she selected.
  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value as LeadStatus;
    // Only call the database if the status actually changed
    // (no point saving "new" → "new")
    if (newStatus !== currentStatus) {
      await updateStatus({ id: leadId, status: newStatus });
    }
  }

  return (
    <select
      value={currentStatus}
      onChange={handleChange}
      // appearance-none = hides the browser's default dropdown arrow
      // We add our own arrow via the backgroundImage style below
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium border-0 cursor-pointer appearance-none pr-6 ${STATUS_STYLES[currentStatus]}`}
      // This inline style draws a tiny chevron (▼) arrow on the right side
      // of the dropdown using an embedded SVG image.
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 6px center",
      }}
    >
      {/* Build one <option> for each status */}
      {ALL_STATUSES.map((s) => (
        <option key={s} value={s}>
          {STATUS_LABELS[s]}
        </option>
      ))}
    </select>
  );
}

// ============================================================================
// EXPANDED DETAILS — The panel that slides open below a row when clicked
// ============================================================================
// When Savanna clicks a row, this section appears underneath it showing
// extra info the lead submitted: phone number, preferred date/time, and
// their message.
//
// colSpan={7} means "stretch this cell across all 7 columns of the table"
// so the expanded section spans the full width of the row above it.
//
// The {lead.phone && (...)} pattern means: "only show this block if
// the lead actually provided a phone number." Same logic for date, time,
// and message. If the lead left everything blank, we show "No additional details."

function ExpandedDetails({
  lead,
}: {
  lead: {
    message?: string;
    phone?: string;
    preferredDate?: string;
    preferredTime?: string;
    listingId?: Id<"listings">;
  };
}) {
  return (
    <tr>
      <td colSpan={7} className="bg-secondary/50 px-6 py-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
          {lead.phone && (
            <div>
              <p className="font-medium text-primary/50">Phone</p>
              <p className="mt-0.5 text-primary">{lead.phone}</p>
            </div>
          )}
          {lead.preferredDate && (
            <div>
              <p className="font-medium text-primary/50">Preferred Date</p>
              <p className="mt-0.5 text-primary">{lead.preferredDate}</p>
            </div>
          )}
          {lead.preferredTime && (
            <div>
              <p className="font-medium text-primary/50">Preferred Time</p>
              <p className="mt-0.5 text-primary">{lead.preferredTime}</p>
            </div>
          )}
          {/* Message gets full width (col-span-4) since it can be long */}
          {lead.message && (
            <div className="sm:col-span-2 lg:col-span-4">
              <p className="font-medium text-primary/50">Message</p>
              {/* whitespace-pre-wrap = keeps line breaks the person typed */}
              <p className="mt-0.5 text-primary whitespace-pre-wrap">
                {lead.message}
              </p>
            </div>
          )}
          {/* If the lead didn't provide ANY extra details, show a fallback message */}
          {!lead.phone && !lead.preferredDate && !lead.preferredTime && !lead.message && (
            <p className="text-primary/40">No additional details.</p>
          )}
        </div>
      </td>
    </tr>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT — Puts everything together
// ============================================================================
//
// STATE (values the page keeps track of):
//   leads      = the full list of leads from the database (live subscription)
//   filter     = which tab is active ("all", "new", "contacted", etc.)
//   expandedId = which row is currently expanded (null = none)
//
// DERIVED VALUES (calculated from the state above):
//   filteredLeads = the leads to actually show in the table (after applying the filter)
//   counts        = how many leads in each status (for the tab badges)
//
// THE TABLE HAS 3 STATES:
//   1. Loading (leads === undefined) → show gray pulsing skeleton rows
//   2. Empty (filteredLeads.length === 0) → show a friendly "no leads yet" message
//   3. Has data → show the actual lead rows

export default function AdminLeads() {
  // Open a live subscription to ALL leads, newest first.
  // This value is `undefined` while loading, then becomes an array.
  const leads = useQuery(api.leads.getAll);

  // Which filter tab is selected. Starts on "all" so Savanna sees everything.
  const [filter, setFilter] = useState<LeadStatus | "all">("all");

  // Which row is expanded. Only one row can be open at a time.
  // null = no row is expanded.
  const [expandedId, setExpandedId] = useState<Id<"leads"> | null>(null);

  // Apply the filter to get the leads we should display.
  // If filter is "all", show everything. Otherwise, only show leads
  // whose status matches the selected tab.
  const filteredLeads =
    leads === undefined
      ? undefined
      : filter === "all"
        ? leads
        : leads.filter((l) => l.status === filter);

  // Count how many leads are in each status bucket.
  // The ?? 0 means "if leads hasn't loaded yet, use 0."
  const counts: Record<LeadStatus | "all", number> = {
    all: leads?.length ?? 0,
    new: leads?.filter((l) => l.status === "new").length ?? 0,
    contacted: leads?.filter((l) => l.status === "contacted").length ?? 0,
    scheduled: leads?.filter((l) => l.status === "scheduled").length ?? 0,
    closed: leads?.filter((l) => l.status === "closed").length ?? 0,
  };

  // Toggle a row open or closed. If the same row is clicked again, close it.
  function toggleExpand(id: Id<"leads">) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  return (
    <div>
      {/* ── Page Header ── */}
      <div>
        <h1 className="text-3xl font-serif text-primary">Leads</h1>
        <p className="mt-1 text-primary/60">
          Track and manage contact form submissions.
        </p>
      </div>

      {/* ── Filter Tabs ── */}
      {/* Only show once leads have loaded (so the counts aren't all 0) */}
      <div className="mt-6">
        {leads !== undefined && (
          <FilterTabs active={filter} onChange={setFilter} counts={counts} />
        )}
      </div>

      {/* ── Leads Table ── */}
      {/* overflow-x-auto = if the table is wider than the screen (mobile),
          it becomes horizontally scrollable instead of breaking the layout */}
      <div className="mt-4 overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-primary/50">
              <th className="w-8 px-3 py-3" />        {/* Chevron column (no header text) */}
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Email</th>
              <th className="px-6 py-3 font-medium">Phone</th>
              <th className="px-6 py-3 font-medium">Listing</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Submitted</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads === undefined ? (
              // ── STATE 1: Loading ──
              // Show 5 fake rows with pulsing gray bars (skeleton UI).
              // This gives Savanna something to look at while the data loads.
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-50">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-4 w-20 animate-pulse rounded bg-secondary" />
                    </td>
                  ))}
                </tr>
              ))
            ) : filteredLeads.length === 0 ? (
              // ── STATE 2: Empty ──
              // No leads match the current filter. Show a helpful message.
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-10 text-center text-primary/40"
                >
                  {filter === "all"
                    ? "No leads yet. They'll show up here when visitors submit the contact form."
                    : `No ${filter} leads.`}
                </td>
              </tr>
            ) : (
              // ── STATE 3: Has data ──
              // Loop through each lead and render a table row.
              filteredLeads.map((lead) => {
                const isExpanded = expandedId === lead._id;
                return (
                  // Fragment = invisible wrapper so we can render 2 <tr> elements
                  // (main row + expanded row) without adding extra HTML.
                  <Fragment key={lead._id}>
                    <tr
                      onClick={() => toggleExpand(lead._id)}
                      // Highlight the row if it's expanded. Add hover effect.
                      className={`border-b border-gray-50 last:border-0 cursor-pointer transition-colors hover:bg-secondary/40 ${
                        isExpanded ? "bg-secondary/30" : ""
                      }`}
                    >
                      {/* Arrow icon: points right when collapsed, down when expanded */}
                      <td className="px-3 py-4 text-primary/40">
                        {isExpanded ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium text-primary">
                        {lead.name}
                      </td>
                      <td className="px-6 py-4 text-primary/70">
                        {lead.email}
                      </td>
                      <td className="px-6 py-4 text-primary/70">
                        {/* ?? "—" means: if phone is null/undefined, show a dash instead */}
                        {lead.phone ?? "—"}
                      </td>
                      <td className="px-6 py-4 text-primary/70">
                        {/* If the lead asked about a specific listing, show it as a link.
                            If they used the general contact form, show "General". */}
                        {lead.listingId ? (
                          <Link
                            href={`/listings/${lead.listingId}`}
                            // stopPropagation = clicking this link should NOT
                            // also expand/collapse the row
                            onClick={(e) => e.stopPropagation()}
                            className="text-accent hover:underline"
                          >
                            {lead.listingTitle ?? "View Listing"}
                          </Link>
                        ) : (
                          <span className="text-primary/40">General</span>
                        )}
                      </td>
                      <td
                        className="px-6 py-4"
                        // stopPropagation = clicking the dropdown should NOT
                        // also expand/collapse the row
                        onClick={(e) => e.stopPropagation()}
                      >
                        <StatusDropdown
                          leadId={lead._id}
                          currentStatus={lead.status}
                        />
                      </td>
                      <td className="px-6 py-4 text-primary/50">
                        {/* _creationTime is a Unix timestamp from Convex.
                            We convert it to a readable date like "2/15/2026". */}
                        {new Date(lead._creationTime).toLocaleDateString()}
                      </td>
                    </tr>

                    {/* If this row is expanded, show the details panel below it */}
                    {isExpanded && <ExpandedDetails lead={lead} />}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
