"use client";

import { useState } from "react";
import { Calendar, dateFnsLocalizer, type Event, type ToolbarProps, type NavigateAction } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, addDays, startOfDay, addMonths } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BookingWithUnit } from "@/types";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const STATUS_CONFIG: Record<string, { bg: string; label: string; dot: string }> = {
  pending:   { bg: "#f59e0b", label: "Pending",   dot: "bg-amber-400" },
  confirmed: { bg: "#10b981", label: "Confirmed", dot: "bg-emerald-500" },
  completed: { bg: "#6366f1", label: "Completed", dot: "bg-indigo-500" },
};

interface CalendarEvent extends Event {
  bookingId: string;
  status: string;
}

function CustomToolbar({ label, onNavigate }: ToolbarProps<CalendarEvent>) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-4 px-1">
      <div className="flex items-center gap-1">
        <Button size="sm" variant="outline" onClick={() => onNavigate("PREV")}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={() => onNavigate("TODAY")}>
          Today
        </Button>
        <Button size="sm" variant="outline" onClick={() => onNavigate("NEXT")}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <p className="font-semibold text-base">{label}</p>
      <div className="flex items-center gap-3">
        {Object.entries(STATUS_CONFIG).map(([, { dot, label: lbl }]) => (
          <span key={lbl} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className={`w-2.5 h-2.5 rounded-full ${dot}`} />
            {lbl}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function BookingCalendar({ bookings }: { bookings: BookingWithUnit[] }) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());

  function handleNavigate(action: NavigateAction) {
    setCurrentDate((prev) => {
      if (action === "PREV") return addMonths(prev, -1);
      if (action === "NEXT") return addMonths(prev, 1);
      if (action === "TODAY") return new Date();
      return prev;
    });
  }

  const events: CalendarEvent[] = bookings.map((b) => ({
    bookingId: b.id,
    title: `${b.guest_name}${b.units ? ` · ${b.units.name}` : ""}`,
    start: new Date(b.check_in),
    end: new Date(b.check_out),
    status: b.status,
  }));

  // Build a map of date → dominant status for day-cell background
  const bookedDays = new Map<string, string>();
  events.forEach((e) => {
    let current = startOfDay(e.start as Date);
    const end = startOfDay(e.end as Date);
    while (current <= end) {
      const key = format(current, "yyyy-MM-dd");
      // confirmed takes priority over pending/completed
      if (!bookedDays.has(key) || e.status === "confirmed") {
        bookedDays.set(key, e.status);
      }
      current = addDays(current, 1);
    }
  });

  const dayBg: Record<string, string> = {
    confirmed: "rgba(16, 185, 129, 0.1)",
    pending:   "rgba(245, 158, 11, 0.1)",
    completed: "rgba(99, 102, 241, 0.1)",
  };

  return (
    <div className="bg-card rounded-xl border p-4 h-[calc(100vh-10rem)]">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "100%" }}
        views={["month"]}
        defaultView="month"
        date={currentDate}
        onNavigate={() => {}}
        components={{ toolbar: (props: ToolbarProps<CalendarEvent>) => <CustomToolbar {...props} onNavigate={handleNavigate} /> }}
        dayPropGetter={(date) => {
          const status = bookedDays.get(format(date, "yyyy-MM-dd"));
          if (!status) return {};
          return { style: { backgroundColor: dayBg[status] ?? "rgba(148,163,184,0.1)" } };
        }}
        eventPropGetter={(event) => {
          const cfg = STATUS_CONFIG[(event as CalendarEvent).status];
          return {
            style: {
              backgroundColor: cfg?.bg ?? "#94a3b8",
              borderRadius: "6px",
              border: "none",
              color: "#fff",
              fontSize: "0.72rem",
              fontWeight: 600,
              padding: "1px 6px",
            },
          };
        }}
        onSelectEvent={(event) => {
          router.push(`/admin/bookings/${(event as CalendarEvent).bookingId}`);
        }}
      />
    </div>
  );
}
