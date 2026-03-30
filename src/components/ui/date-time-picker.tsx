"use client";

import { useState } from "react";
import { format, isValid } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DateTimePickerProps {
  value: string; // "yyyy-MM-dd'T'HH:mm" or ""
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Pick date & time",
  disabled,
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false);

  const parsed = value ? new Date(value) : undefined;
  const valid = parsed && isValid(parsed);

  const hours = valid ? parsed.getHours() : 12;
  const minutes = valid ? parsed.getMinutes() : 0;

  function toIso(d: Date): string {
    return format(d, "yyyy-MM-dd'T'HH:mm");
  }

  function handleDaySelect(day: Date | undefined) {
    if (!day) return;
    const next = new Date(day);
    next.setHours(hours);
    next.setMinutes(minutes);
    onChange(toIso(next));
  }

  function handleHour(h: number) {
    const base = valid ? new Date(parsed) : new Date();
    base.setHours(Math.min(23, Math.max(0, h)));
    base.setMinutes(minutes);
    onChange(toIso(base));
  }

  function handleMinute(m: number) {
    const base = valid ? new Date(parsed) : new Date();
    base.setHours(hours);
    base.setMinutes(Math.min(59, Math.max(0, m)));
    onChange(toIso(base));
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !valid && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          {valid
            ? format(parsed, "MMM d, yyyy 'at' h:mm aa")
            : placeholder}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={valid ? parsed : undefined}
          onSelect={handleDaySelect}
          autoFocus
        />

        {/* Time row */}
        <div className="border-t px-3 py-3 flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-sm text-muted-foreground">Time</span>

          <div className="flex items-center gap-1 ml-auto">
            <input
              type="number"
              min={0}
              max={23}
              value={String(hours).padStart(2, "0")}
              onChange={(e) => handleHour(Number(e.target.value))}
              className="w-12 border rounded-md px-1.5 py-1 text-sm text-center tabular-nums focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <span className="text-muted-foreground font-medium">:</span>
            <input
              type="number"
              min={0}
              max={59}
              step={5}
              value={String(minutes).padStart(2, "0")}
              onChange={(e) => handleMinute(Number(e.target.value))}
              className="w-12 border rounded-md px-1.5 py-1 text-sm text-center tabular-nums focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <span className="text-xs text-muted-foreground w-7">
              {hours < 12 ? "AM" : "PM"}
            </span>
          </div>

          <Button size="sm" className="ml-2" onClick={() => setOpen(false)}>
            Done
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
