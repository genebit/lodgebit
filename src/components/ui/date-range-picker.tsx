"use client";

import { useState, useEffect } from "react";
import { format, isValid, parseISO } from "date-fns";
import { CalendarIcon, Clock, ArrowRight } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

interface DateRangePickerProps {
  checkIn: string; // "yyyy-MM-dd'T'HH:mm" or ""
  checkOut: string; // "yyyy-MM-dd'T'HH:mm" or ""
  onChangeCheckIn: (value: string) => void;
  onChangeCheckOut: (value: string) => void;
  disabled?: boolean;
}

function toIso(d: Date): string {
  return format(d, "yyyy-MM-dd'T'HH:mm");
}

function parseTime(iso: string) {
  const d = iso ? parseISO(iso) : null;
  if (!d || !isValid(d)) return { hours24: 14, minutes: 0, isPm: true, hours12: 2 };
  const hours24 = d.getHours();
  const minutes = d.getMinutes();
  const isPm = hours24 >= 12;
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return { hours24, minutes, isPm, hours12 };
}

interface TimeInputProps {
  label: string;
  iso: string;
  onChange: (value: string) => void;
}

function TimeInput({ label, iso, onChange }: TimeInputProps) {
  const parsed = iso ? parseISO(iso) : null;
  const validDate = parsed && isValid(parsed) ? parsed : null;
  const { hours24, minutes, isPm, hours12 } = parseTime(iso);

  function handleHour(h: number) {
    const clamped = Math.min(12, Math.max(1, h));
    const next24 = isPm ? (clamped === 12 ? 12 : clamped + 12) : clamped === 12 ? 0 : clamped;
    const base = validDate ? new Date(validDate) : new Date();
    base.setHours(next24);
    base.setMinutes(minutes);
    onChange(toIso(base));
  }

  function handleMinute(m: number) {
    const base = validDate ? new Date(validDate) : new Date();
    base.setHours(hours24);
    base.setMinutes(Math.min(59, Math.max(0, m)));
    onChange(toIso(base));
  }

  function toggleAmPm() {
    const base = validDate ? new Date(validDate) : new Date();
    base.setHours(isPm ? hours24 - 12 : hours24 + 12);
    base.setMinutes(minutes);
    onChange(toIso(base));
  }

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
        <Clock className="h-3 w-3" /> {label}
      </p>
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          min={1}
          max={12}
          value={String(hours12).padStart(2, "0")}
          onChange={(e) => handleHour(Number(e.target.value))}
          className="w-16 border rounded-md px-2 py-2.5 text-base text-center tabular-nums bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <span className="text-muted-foreground font-bold text-lg">:</span>
        <input
          type="number"
          min={0}
          max={59}
          step={5}
          value={String(minutes).padStart(2, "0")}
          onChange={(e) => handleMinute(Number(e.target.value))}
          className="w-16 border rounded-md px-2 py-2.5 text-base text-center tabular-nums bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="button"
          onClick={toggleAmPm}
          className="text-sm font-semibold border rounded-md px-3.5 py-2.5 hover:bg-muted transition-colors"
        >
          {isPm ? "PM" : "AM"}
        </button>
      </div>
    </div>
  );
}

export function DateRangePicker({
  checkIn,
  checkOut,
  onChangeCheckIn,
  onChangeCheckOut,
  disabled,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [isSmall, setIsSmall] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    setIsSmall(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsSmall(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const checkInDate = checkIn ? parseISO(checkIn) : undefined;
  const checkOutDate = checkOut ? parseISO(checkOut) : undefined;
  const validIn = checkInDate && isValid(checkInDate);
  const validOut = checkOutDate && isValid(checkOutDate);

  const range: DateRange = {
    from: validIn ? checkInDate : undefined,
    to: validOut ? checkOutDate : undefined,
  };

  function handleRangeSelect(newRange: DateRange | undefined) {
    if (!newRange) return;

    if (newRange.from) {
      // Preserve existing times if available, otherwise default to 14:00 check-in
      const existingIn = checkIn ? parseISO(checkIn) : null;
      const base = new Date(newRange.from);
      if (existingIn && isValid(existingIn)) {
        base.setHours(existingIn.getHours(), existingIn.getMinutes());
      } else {
        base.setHours(14, 0);
      }
      onChangeCheckIn(toIso(base));
    }

    if (newRange.to) {
      // Default check-out to 12:00 noon
      const existingOut = checkOut ? parseISO(checkOut) : null;
      const base = new Date(newRange.to);
      if (existingOut && isValid(existingOut)) {
        base.setHours(existingOut.getHours(), existingOut.getMinutes());
      } else {
        base.setHours(12, 0);
      }
      onChangeCheckOut(toIso(base));
    } else {
      // User is still picking — clear check-out
      onChangeCheckOut("");
    }
  }

  const label = validIn && validOut
    ? `${format(checkInDate!, "MMM d")} → ${format(checkOutDate!, "MMM d, yyyy")}`
    : validIn
    ? `${format(checkInDate!, "MMM d, yyyy")} → Pick check-out`
    : "Pick check-in & check-out";

  return (
    <>
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className={cn("w-full justify-start text-left font-normal", !validIn && "text-muted-foreground")}
      >
        <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
        {validIn && validOut ? (
          <span className="flex items-center gap-1.5">
            {format(checkInDate!, "MMM d, yyyy 'at' h:mm aa")}
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
            {format(checkOutDate!, "MMM d, yyyy 'at' h:mm aa")}
          </span>
        ) : (
          label
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl p-0 gap-0 max-h-[90vh] flex flex-col overflow-hidden">
          <DialogHeader className="px-4 pt-4 pb-0 shrink-0">
            <DialogTitle className="text-sm font-semibold">Select dates &amp; times</DialogTitle>
          </DialogHeader>

          <div className="overflow-y-auto flex-1">
            <Calendar
              mode="range"
              selected={range}
              onSelect={handleRangeSelect}
              numberOfMonths={isSmall ? 1 : 2}
              autoFocus
              className="p-4 w-full"
            />
          </div>

          <div className="border-t px-4 py-3 space-y-3 shrink-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TimeInput label="Check-in time" iso={checkIn} onChange={onChangeCheckIn} />
              <TimeInput label="Check-out time" iso={checkOut} onChange={onChangeCheckOut} />
            </div>
            <div className="flex justify-end">
              <Button size="sm" onClick={() => setOpen(false)}>Done</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
