"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  isWithinInterval,
  parseISO,
  format,
  eachDayOfInterval,
  eachMonthOfInterval,
} from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Download, TrendingUp, Users, Building2 } from "lucide-react";
import type { DashboardBooking } from "@/app/admin/dashboard/page";

type Period = "week" | "month" | "year" | "all";

interface Props {
  bookings: DashboardBooking[];
  residenceCount: number;
  unitCount: number;
}

const PERIOD_LABELS: Record<Period, string> = {
  week: "This Week",
  month: "This Month",
  year: "This Year",
  all: "All Time",
};

function getPeriodInterval(period: Period): { start: Date; end: Date } | null {
  const now = new Date();
  if (period === "week")
    return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
  if (period === "month") return { start: startOfMonth(now), end: endOfMonth(now) };
  if (period === "year") return { start: startOfYear(now), end: endOfYear(now) };
  return null;
}

function filterByPeriod(bookings: DashboardBooking[], period: Period): DashboardBooking[] {
  const interval = getPeriodInterval(period);
  if (!interval) return bookings;
  return bookings.filter((b) => isWithinInterval(parseISO(b.check_in), interval));
}

function formatCurrency(val: number) {
  return `₱${val.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  confirmed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  completed: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export default function DashboardClient({ bookings, residenceCount, unitCount }: Props) {
  const [period, setPeriod] = useState<Period>("month");

  const filtered = useMemo(() => filterByPeriod(bookings, period), [bookings, period]);

  const kpis = useMemo(() => {
    const nonCancelled = filtered.filter((b) => b.status !== "cancelled");
    const grossRevenue = nonCancelled.reduce((sum, b) => sum + (b.total_amount ?? 0), 0);
    return {
      total: filtered.length,
      confirmed: filtered.filter((b) => b.status === "confirmed").length,
      completed: filtered.filter((b) => b.status === "completed").length,
      cancelled: filtered.filter((b) => b.status === "cancelled").length,
      pending: filtered.filter((b) => b.status === "pending").length,
      grossRevenue,
    };
  }, [filtered]);

  const chartData = useMemo(() => {
    const nonCancelled = filtered.filter((b) => b.status !== "cancelled" && b.total_amount != null);
    const interval = getPeriodInterval(period);

    if (period === "week") {
      const start = interval?.start ?? startOfWeek(new Date(), { weekStartsOn: 1 });
      const end = interval?.end ?? endOfWeek(new Date(), { weekStartsOn: 1 });
      const days = eachDayOfInterval({ start, end });
      return days.map((day) => {
        const label = format(day, "EEE");
        const revenue = nonCancelled
          .filter((b) => format(parseISO(b.check_in), "yyyy-MM-dd") === format(day, "yyyy-MM-dd"))
          .reduce((sum, b) => sum + (b.total_amount ?? 0), 0);
        return { label, revenue };
      });
    }

    if (period === "month") {
      const start = interval?.start ?? startOfMonth(new Date());
      const end = interval?.end ?? endOfMonth(new Date());
      const days = eachDayOfInterval({ start, end });
      return days.map((day) => {
        const label = format(day, "d");
        const revenue = nonCancelled
          .filter((b) => format(parseISO(b.check_in), "yyyy-MM-dd") === format(day, "yyyy-MM-dd"))
          .reduce((sum, b) => sum + (b.total_amount ?? 0), 0);
        return { label, revenue };
      });
    }

    if (period === "year") {
      const start = interval?.start ?? startOfYear(new Date());
      const end = interval?.end ?? endOfYear(new Date());
      const months = eachMonthOfInterval({ start, end });
      return months.map((month) => {
        const label = format(month, "MMM");
        const revenue = nonCancelled
          .filter((b) => format(parseISO(b.check_in), "yyyy-MM") === format(month, "yyyy-MM"))
          .reduce((sum, b) => sum + (b.total_amount ?? 0), 0);
        return { label, revenue };
      });
    }

    // All time — group by year-month
    const sorted = [...nonCancelled].sort((a, b) => a.check_in.localeCompare(b.check_in));
    if (sorted.length === 0) return [];
    const start = parseISO(sorted[0].check_in);
    const end = parseISO(sorted[sorted.length - 1].check_in);
    const months = eachMonthOfInterval({ start, end });
    return months.map((month) => {
      const label = format(month, "MMM yy");
      const revenue = nonCancelled
        .filter((b) => format(parseISO(b.check_in), "yyyy-MM") === format(month, "yyyy-MM"))
        .reduce((sum, b) => sum + (b.total_amount ?? 0), 0);
      return { label, revenue };
    });
  }, [filtered, period]);

  const recentBookings = useMemo(() => bookings.slice(0, 10), [bookings]);

  const bookedDates = useMemo(
    () =>
      filtered
        .filter((b) => b.status !== "cancelled")
        .flatMap((b) => {
          try {
            return eachDayOfInterval({ start: parseISO(b.check_in), end: parseISO(b.check_out) });
          } catch {
            return [];
          }
        }),
    [filtered],
  );

  async function handleExport() {
    const { utils, writeFile } = await import("xlsx");
    const rows = filtered.map((b) => ({
      "Guest Name": b.guest_name,
      Contact: b.guest_contact ?? "",
      Unit: b.unit_name ?? "",
      Residence: b.residence_name ?? "",
      "Check-in": format(parseISO(b.check_in), "yyyy-MM-dd"),
      "Check-out": format(parseISO(b.check_out), "yyyy-MM-dd"),
      Pax: b.pax ?? "",
      Status: b.status,
      Source: b.source,
      "Amount (₱)": b.total_amount ?? "",
    }));
    const ws = utils.json_to_sheet(rows);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Bookings");
    const filename = `bookings-${period}-${format(new Date(), "yyyy-MM-dd")}.xlsx`;
    writeFile(wb, filename);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-xl font-semibold">Dashboard</h2>
        <div className="flex items-center gap-2 flex-wrap">
          {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                period === p
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
          <Button size="sm" variant="outline" onClick={handleExport} className="gap-1.5">
            <Download className="h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        <div className="bg-card border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground font-medium">Booking Breakdown</p>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-semibold leading-tight">{kpis.total}</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {[
              { label: "Pending", value: kpis.pending, color: "bg-yellow-400" },
              { label: "Confirmed", value: kpis.confirmed, color: "bg-green-500" },
              { label: "Completed", value: kpis.completed, color: "bg-indigo-500" },
              { label: "Cancelled", value: kpis.cancelled, color: "bg-red-500" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${color}`} />
                  <span className="text-muted-foreground">{label}</span>
                </div>
                <span className="font-medium tabular-nums ml-1">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <KpiCard
          label="Gross Revenue"
          value={formatCurrency(kpis.grossRevenue)}
          icon={<TrendingUp className="h-4 w-4 text-emerald-500" />}
        />

        <KpiCard
          label="Properties"
          value={`${residenceCount} residences · ${unitCount} units`}
          icon={<Building2 className="h-4 w-4 text-muted-foreground" />}
          small
        />
      </div>

      <div className="flex gap-3 basis-2/4">
        <div className="bg-card border rounded-lg p-4 basis-full">
          <h3 className="text-sm font-semibold mb-4">Gross Revenue — {PERIOD_LABELS[period]}</h3>
          {chartData.length === 0 || chartData.every((d) => d.revenue === 0) ? (
            <p className="text-sm text-muted-foreground text-center py-10">No revenue data for this period.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} width={52} />
                <Tooltip
                  formatter={(value) => [formatCurrency(Number(value)), "Revenue"]}
                  contentStyle={{
                    fontSize: 12,
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    color: "hsl(var(--foreground))",
                    borderRadius: "0.375rem",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="bg-card border rounded-lg p-3 flex flex-col gap-1">
          <p className="text-xs text-muted-foreground font-medium px-1">Bookings This Period</p>
          <Calendar
            mode="single"
            modifiers={{ booked: bookedDates }}
            modifiersClassNames={{
              booked: "!bg-green-500/20 !text-green-700 dark:!text-green-400 font-semibold rounded-md",
            }}
            classNames={{
              root: "w-fill",
              months: "flex flex-col",
              month: "space-y-2",
              caption: "flex justify-center items-center gap-1 text-xs font-medium py-1",
              caption_label: "text-xs font-medium",
              nav: "flex items-center gap-1",
              nav_button: "h-5 w-5 bg-transparent p-0 opacity-50 hover:opacity-100",
              nav_button_previous: "absolute left-1",
              nav_button_next: "absolute right-1",
              table: "w-full border-collapse",
              head_row: "flex",
              head_cell: "text-muted-foreground rounded-md w-7 font-normal text-[0.65rem]",
              row: "flex w-full mt-1",
              cell: "h-7 w-7 text-center text-xs p-0 relative",
              day: "h-7 w-7 p-0 font-normal text-xs rounded-md hover:bg-accent hover:text-accent-foreground",
              day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
              day_today: "bg-accent text-accent-foreground font-semibold",
              day_outside: "text-muted-foreground/40",
              day_disabled: "text-muted-foreground opacity-50",
            }}
          />
        </div>
      </div>

      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="text-sm font-semibold">Recent Bookings</h3>
          <Link href="/admin/bookings" className="text-xs text-primary hover:underline">
            View all
          </Link>
        </div>
        <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30 text-xs font-medium text-muted-foreground">
          <span className="flex-1">Guest · Unit · Dates</span>
          <div className="flex items-center gap-3 shrink-0">
            <span className="w-24 text-right">Amount</span>
            <span className="w-20 text-right">Status</span>
          </div>
        </div>
        <div className="divide-y">
          {recentBookings.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No bookings yet.</p>
          )}
          {recentBookings.map((b) => (
            <Link
              key={b.id}
              href={`/admin/bookings/${b.id}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{b.guest_name}</p>
                <p className="text-xs text-muted-foreground">
                  {b.unit_name ?? "—"} · {format(parseISO(b.check_in), "MMM d")} –{" "}
                  {format(parseISO(b.check_out), "MMM d, yyyy")}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-3">
                {b.total_amount != null && (
                  <span className="text-sm font-medium w-24 text-right">{formatCurrency(b.total_amount)}</span>
                )}
                <span
                  className={`inline-flex items-center justify-center w-20 px-2 py-0.5 rounded text-xs font-medium ${statusColors[b.status] ?? "bg-muted text-muted-foreground"}`}
                >
                  {b.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  icon,
  small,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  small?: boolean;
}) {
  return (
    <div className="bg-card border rounded-lg p-4 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        {icon}
      </div>
      <p className={`font-semibold leading-tight ${small ? "text-sm" : "text-2xl"}`}>{value}</p>
    </div>
  );
}
