import { useMemo, useState } from "react";
import { ArrowLeft, Calendar, Clock, Search, Sun, Sunset } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BookingSlot } from "@/types/user/scheduledBooking";

const SHIFTS: {
  value: BookingSlot;
  title: string;
  timeRange: string;
  description: string;
  startMinutes: number;
  icon: typeof Sun;
}[] = [
  {
    value: "morning",
    title: "Morning Shift",
    timeRange: "09:00 – 13:00 IST",
    description: "Ideal for morning inspections and quick turnarounds.",
    startMinutes: 9 * 60,
    icon: Sun,
  },
  {
    value: "afternoon",
    title: "Afternoon Shift",
    timeRange: "14:00 – 18:00 IST",
    description: "Best for afternoon diagnostics and scheduled repairs.",
    startMinutes: 14 * 60,
    icon: Sunset,
  },
  {
    value: "full_day",
    title: "Full Day",
    timeRange: "09:00 – 18:00 IST",
    description: "Requires both morning and afternoon availability.",
    startMinutes: 9 * 60,
    icon: Clock,
  },
];

function getIndiaTodayKeyAndMinutes(): {
  todayKey: string;
  currentMinutes: number;
} {
  const parts = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const get = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? "00";

  const rawHour = Number(get("hour"));
  const hours = rawHour === 24 ? 0 : rawHour;
  const minutes = Number(get("minute"));

  return {
    todayKey: `${get("year")}-${get("month")}-${get("day")}`,
    currentMinutes: hours * 60 + minutes,
  };
}

interface BookingDateShiftSelectorProps {
  scheduledDate: string;
  slot: BookingSlot | null;
  isSearching: boolean;
  onDateChange: (date: string) => void;
  onSlotChange: (slot: BookingSlot) => void;
  onBack: () => void;
  onDiscover: () => void;
}

export function BookingDateShiftSelector({
  scheduledDate,
  slot,
  isSearching,
  onDateChange,
  onSlotChange,
  onBack,
  onDiscover,
}: BookingDateShiftSelectorProps) {
  const [validationError, setValidationError] = useState("");
  const { todayKey, currentMinutes } = useMemo(
    () => getIndiaTodayKeyAndMinutes(),
    []
  );

  const isTodaySelected = scheduledDate === todayKey;
  const isPastDate = Boolean(scheduledDate && scheduledDate < todayKey);

  const isShiftStartedForToday = (startMinutes: number) =>
    isTodaySelected && currentMinutes >= startMinutes;

  const handleDateInput = (nextDate: string) => {
    setValidationError("");
    onDateChange(nextDate);

    if (nextDate && nextDate < todayKey) {
      setValidationError("Booking date cannot be in the past (Asia/Kolkata).");
    }
  };

  const handleSearchClick = () => {
    if (!scheduledDate) {
      setValidationError("Please choose a preferred booking date.");
      return;
    }
    if (scheduledDate < todayKey) {
      setValidationError("Booking date cannot be in the past (Asia/Kolkata).");
      return;
    }
    if (!slot) {
      setValidationError("Please choose an available shift.");
      return;
    }

    const chosenShift = SHIFTS.find((s) => s.value === slot);
    if (chosenShift && isShiftStartedForToday(chosenShift.startMinutes)) {
      setValidationError(
        `${chosenShift.title} has already started for today. Please choose another shift or a future date.`
      );
      return;
    }

    setValidationError("");
    onDiscover();
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-foreground">
          Step 4: Select Date & Shift
        </h2>
        <p className="text-xs text-muted-foreground">
          All booking slots follow India Standard Time (Asia/Kolkata).
        </p>
      </div>

      {/* Date Picker */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-2 max-w-sm">
        <Label
          htmlFor="bookingDate"
          className="flex items-center gap-2 text-xs font-medium text-foreground"
        >
          <Calendar className="h-4 w-4 text-primary" />
          Preferred Date *
        </Label>
        <Input
          id="bookingDate"
          type="date"
          min={todayKey}
          value={scheduledDate}
          onChange={(e) => handleDateInput(e.target.value)}
          className="h-11 bg-input border-border text-xs text-foreground"
        />
      </div>

      {/* Shift Selector */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-foreground">
          Select Shift *
        </Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SHIFTS.map((item) => {
            const Icon = item.icon;
            const disabled =
              isPastDate || isShiftStartedForToday(item.startMinutes);
            const isSelected = slot === item.value && !disabled;

            return (
              <button
                key={item.value}
                type="button"
                disabled={disabled}
                onClick={() => {
                  setValidationError("");
                  onSlotChange(item.value);
                }}
                className={`rounded-2xl border p-4 text-left transition-all space-y-2 ${
                  disabled
                    ? "border-border bg-muted/40 opacity-50 cursor-not-allowed"
                    : isSelected
                      ? "border-primary bg-primary/10 ring-1 ring-primary cursor-pointer"
                      : "border-border bg-card hover:border-primary/40 cursor-pointer"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-sm font-bold text-foreground">
                    <Icon className="h-4 w-4 text-primary" />
                    {item.title}
                  </span>
                </div>
                <p className="text-xs font-mono font-semibold text-primary">
                  {item.timeRange}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {disabled && isTodaySelected
                    ? "This shift has already started for today."
                    : item.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {validationError && (
        <p role="alert" className="text-xs text-destructive">
          {validationError}
        </p>
      )}

      <div className="flex items-center justify-between pt-2">
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back
        </Button>

        <Button
          type="button"
          onClick={handleSearchClick}
          disabled={isSearching || !scheduledDate || !slot || isPastDate}
        >
          <Search className="h-4 w-4 mr-1.5" />
          {isSearching ? "Finding Mechanics..." : "Find Available Mechanics"}
        </Button>
      </div>
    </div>
  );
}

