"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Home, TrendingUp, Users, UserPlus } from "lucide-react";

// ─── STAT CARD ───

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number | undefined;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-primary/50">{label}</p>
          {value === undefined ? (
            <div className="mt-1 h-8 w-16 animate-pulse rounded bg-secondary" />
          ) : (
            <p
              className={`mt-1 text-3xl font-bold ${accent ? "text-accent" : "text-primary"}`}
            >
              {value}
            </p>
          )}
        </div>
        <div className="rounded-lg bg-secondary p-3">
          <Icon size={22} className="text-primary/40" />
        </div>
      </div>
    </div>
  );
}

// ─── STATUS BADGE ───

const STATUS_STYLES: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-amber-100 text-amber-700",
  scheduled: "bg-emerald-100 text-emerald-700",
  closed: "bg-gray-100 text-gray-500",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[status] ?? "bg-gray-100 text-gray-500"}`}
    >
      {status}
    </span>
  );
}

// ─── DASHBOARD PAGE ───

export default function AdminDashboard() {
  const listings = useQuery(api.listings.getAll);
  const leads = useQuery(api.leads.getAll);

  // Derived counts (undefined while loading)
  const totalListings = listings?.length;
  const activeListings = listings?.filter(
    (l) => l.status === "for-sale" || l.status === "pending"
  ).length;
  const totalLeads = leads?.length;
  const newLeads = leads?.filter((l) => l.status === "new").length;

  // Show the 5 most recent leads (already sorted desc by Convex)
  const recentLeads = leads?.slice(0, 5);

  return (
    <div>
      <h1 className="text-3xl font-serif text-primary">Dashboard</h1>
      <p className="mt-1 text-primary/60">
        Overview of listings and leads.
      </p>

      {/* Stat Cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Listings" value={totalListings} icon={Home} />
        <StatCard
          label="Active Listings"
          value={activeListings}
          icon={TrendingUp}
        />
        <StatCard label="Total Leads" value={totalLeads} icon={Users} />
        <StatCard
          label="New Leads"
          value={newLeads}
          icon={UserPlus}
          accent
        />
      </div>

      {/* Recent Leads Table */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold text-primary">Recent Leads</h2>

        <div className="mt-4 overflow-x-auto rounded-xl bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-primary/50">
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Listing</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentLeads === undefined ? (
                // Loading skeleton — 5 placeholder rows
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 w-24 animate-pulse rounded bg-secondary" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : recentLeads.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-primary/40"
                  >
                    No leads yet. They&apos;ll show up here when visitors
                    submit the contact form.
                  </td>
                </tr>
              ) : (
                recentLeads.map((lead) => (
                  <tr
                    key={lead._id}
                    className="border-b border-gray-50 last:border-0"
                  >
                    <td className="px-6 py-4 font-medium text-primary">
                      {lead.name}
                    </td>
                    <td className="px-6 py-4 text-primary/70">{lead.email}</td>
                    <td className="px-6 py-4 text-primary/70">
                      {lead.listingTitle ?? "—"}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className="px-6 py-4 text-primary/50">
                      {new Date(lead._creationTime).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
