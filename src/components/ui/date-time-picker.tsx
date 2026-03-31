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

export function DateTimePicker({ value, onChange, placeholder = "Pick date & time", disabled }: DateTimePickerProps) {
  const [open, setOpen] = useState(false);

  const parsed = value ? new Date(value) : undefined;
  const valid = parsed && isValid(parsed);

  const hours24 = valid ? parsed.getHours() : 12;
  const minutes = valid ? parsed.getMinutes() : 0;
  const isPm = hours24 >= 12;
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;

  function toIso(d: Date): string {
    return format(d, "yyyy-MM-dd'T'HH:mm");
  }

  function handleDaySelect(day: Date | undefined) {
    if (!day) return;
    const next = new Date(day);
    next.setHours(hours24);
    next.setMinutes(minutes);
    onChange(toIso(next));
  }

  function handleHour(h: number) {
    const clamped = Math.min(12, Math.max(1, h));
    const next24 = isPm ? (clamped === 12 ? 12 : clamped + 12) : clamped === 12 ? 0 : clamped;
    const base = valid ? new Date(parsed) : new Date();
    base.setHours(next24);
    base.setMinutes(minutes);
    onChange(toIso(base));
  }

  function handleMinute(m: number) {
    const base = valid ? new Date(parsed) : new Date();
    base.setHours(hours24);
    base.setMinutes(Math.min(59, Math.max(0, m)));
    onChange(toIso(base));
  }

  function toggleAmPm() {
    const base = valid ? new Date(parsed) : new Date();
    const newHours = isPm ? hours24 - 12 : hours24 + 12;
    base.setHours(newHours);
    base.setMinutes(minutes);
    onChange(toIso(base));
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn("w-full justify-start text-left font-normal", !valid && "text-muted-foreground")}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          {valid ? format(parsed, "MMM d, yyyy 'at' h:mm aa") : placeholder}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto min-w-[320px] p-0" align="start">
        <Calendar
          mode="single"
          selected={valid ? parsed : undefined}
          onSelect={handleDaySelect}
          autoFocus
          className="!w-full"
        />

        <div className="border-t px-3 py-3 flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
          <div className="flex items-center gap-1 ml-auto">
            <input
              type="number"
              min={1}
              max={12}
              value={String(hours12).padStart(2, "0")}
              onChange={(e) => handleHour(Number(e.target.value))}
              className="border rounded-md px-1.5 py-1.5 text-sm text-center tabular-nums focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <span className="text-muted-foreground font-medium">:</span>
            <input
              type="number"
              min={0}
              max={59}
              step={5}
              value={String(minutes).padStart(2, "0")}
              onChange={(e) => handleMinute(Number(e.target.value))}
              className="border rounded-md px-1.5 py-1.5 text-sm text-center tabular-nums focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="button"
              onClick={toggleAmPm}
              className="text-xs font-semibold border rounded-md px-3 py-2 hover:bg-muted transition-colors"
            >
              {isPm ? "PM" : "AM"}
            </button>
          </div>

          <Button size="sm" className="ml-2" onClick={() => setOpen(false)}>
            Done
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
