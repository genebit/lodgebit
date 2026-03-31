"use client";

import { useState } from "react";
import { Calendar as ShadcnCalendar } from "@/components/ui/calendar";
import { Calendar as BigCalendar, dateFnsLocalizer, type Event } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, eachDayOfInterval, parseISO, startOfDay, addMonths } from "date-fns";
import { enUS } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

interface BookingEvent extends Event { unitName: string; }

interface AvailabilityCalendarProps {
  bookings: {
    check_in: string;
    check_out: string;
    unit_name: string;
  }[];
}

export default function AvailabilityCalendar({ bookings }: AvailabilityCalendarProps) {
  const [month, setMonth] = useState<Date>(new Date());

  const events: BookingEvent[] = bookings.map((b) => ({
    title: `${b.unit_name} — Booked`,
    start: new Date(b.check_in),
    end: new Date(b.check_out),
    unitName: b.unit_name,
  }));

  const bookedDates: Date[] = bookings.flatMap((b) => {
    try {
      return eachDayOfInterval({
        start: startOfDay(parseISO(b.check_in)),
        end: startOfDay(parseISO(b.check_out)),
      });
    } catch {
      return [];
    }
  });

  return (
    <>
      {/* Mobile: shadcn calendar with dots */}
      <div className="flex sm:hidden flex-col items-center gap-4">
        <ShadcnCalendar
          mode="single"
          month={month}
          onMonthChange={setMonth}
          modifiers={{ booked: bookedDates }}
          modifiersClassNames={{
            booked:
              "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:rounded-full after:bg-blue-500",
          }}
          classNames={{
            months: "flex flex-col gap-4",
            month: "space-y-4 w-full",
            caption: "flex justify-center pt-1 relative items-center",
            caption_label: "text-sm font-semibold text-slate-700",
            nav: "space-x-1 flex items-center",
            nav_button:
              "h-7 w-7 bg-transparent hover:bg-slate-100 rounded-full flex items-center justify-center transition-colors",
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            table: "w-full border-collapse",
            head_row: "flex",
            head_cell: "text-slate-400 rounded-md w-9 font-medium text-xs flex-1 text-center py-1",
            row: "flex w-full mt-1",
            cell: "flex-1 text-center text-sm relative p-0",
            day: "h-9 w-9 mx-auto p-0 font-normal rounded-full hover:bg-slate-100 transition-colors flex items-center justify-center text-slate-700 text-sm",
            day_selected: "bg-slate-900 text-white hover:bg-slate-800",
            day_today: "font-bold text-slate-900 bg-slate-100",
            day_outside: "text-slate-300",
            day_disabled: "text-slate-300 opacity-50",
          }}
        />
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
            Dates already booked
          </span>
        </div>
      </div>

      {/* Desktop: react-big-calendar */}
      <div className="hidden sm:block">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setMonth((p) => addMonths(p, -1))}
            className="h-8 w-8 rounded-full border border-slate-200 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="h-4 w-4 text-slate-600" />
          </button>
          <span className="text-sm font-semibold text-slate-700">
            {format(month, "MMMM yyyy")}
          </span>
          <button
            onClick={() => setMonth((p) => addMonths(p, 1))}
            className="h-8 w-8 rounded-full border border-slate-200 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <ChevronRight className="h-4 w-4 text-slate-600" />
          </button>
        </div>
        <div className="h-[480px]">
          <BigCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: "100%" }}
            date={month}
            onNavigate={() => {}}
            toolbar={false}
            views={["month"]}
            defaultView="month"
            eventPropGetter={() => ({
              style: {
                backgroundColor: "#3b82f6",
                borderRadius: "6px",
                border: "none",
                color: "#fff",
                fontSize: "0.7rem",
                fontWeight: 600,
                padding: "1px 6px",
              },
            })}
          />
        </div>
      </div>
    </>
  );
}
