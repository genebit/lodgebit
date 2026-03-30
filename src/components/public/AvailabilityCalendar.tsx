"use client";

import { Calendar, dateFnsLocalizer, type Event } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

interface BookingEvent extends Event {
  unitName: string;
}

interface AvailabilityCalendarProps {
  bookings: {
    check_in: string;
    check_out: string;
    unit_name: string;
  }[];
}

export default function AvailabilityCalendar({ bookings }: AvailabilityCalendarProps) {
  const events: BookingEvent[] = bookings.map((b) => ({
    title: `${b.unit_name} — Booked`,
    start: new Date(b.check_in),
    end: new Date(b.check_out),
    unitName: b.unit_name,
  }));

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Booking Calendar</h2>
      <div className="h-[500px] bg-card rounded-lg p-4 border">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100%" }}
          eventPropGetter={() => ({
            style: {
              backgroundColor: "#1e3a5f",
              borderRadius: "4px",
              border: "none",
              color: "#fff",
              fontSize: "0.75rem",
            },
          })}
          views={["month"]}
          defaultView="month"
        />
      </div>
    </div>
  );
}
