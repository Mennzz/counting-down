import { useEffect, useMemo, useState, type FormEvent } from "react";
import { CalendarClock, Eye, LockKeyhole } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type {
  XiaoBaoRoutineFrequency,
  XiaoBaoRoutineInput,
  XiaoBaoRoutineWeekday,
  XiaoBaoScheduledItemKind,
} from "@/types/xiaobao";
import { defaultXiaoBaoRoutineInput, XIAOBAO_WEEKDAYS } from "@/utils/xiaobao-routines";

const COMMON_TIMEZONES = [
  "Europe/Amsterdam",
  "Europe/London",
  "Asia/Shanghai",
  "Asia/Hong_Kong",
  "America/New_York",
  "America/Los_Angeles",
  "UTC",
];

const editableValue = (input: XiaoBaoRoutineInput): XiaoBaoRoutineInput => ({
  kind: input.kind,
  name: input.name,
  instruction: input.instruction ?? null,
  message: input.message ?? null,
  schedule: {
    frequency: input.schedule.frequency,
    localDate: input.schedule.localDate ?? undefined,
    localTime: input.schedule.localTime,
    timezone: input.schedule.timezone,
    weekdays: [...input.schedule.weekdays],
  },
  contextProfile: input.contextProfile,
});

export function XiaoBaoRoutineEditor({
  initialValue,
  submitLabel,
  isSubmitting = false,
  onSubmit,
}: {
  initialValue?: XiaoBaoRoutineInput;
  submitLabel: string;
  isSubmitting?: boolean;
  onSubmit: (value: XiaoBaoRoutineInput) => Promise<void> | void;
}) {
  const [draft, setDraft] = useState<XiaoBaoRoutineInput>(() => editableValue(initialValue ?? defaultXiaoBaoRoutineInput()));

  useEffect(() => {
    setDraft(editableValue(initialValue ?? defaultXiaoBaoRoutineInput()));
  }, [initialValue]);

  const timezoneIsValid = useMemo(() => {
    if (!draft.schedule.timezone.trim()) return false;
    try {
      new Intl.DateTimeFormat(undefined, { timeZone: draft.schedule.timezone.trim() }).format();
      return true;
    } catch {
      return false;
    }
  }, [draft.schedule.timezone]);

  const isValid = useMemo(() => {
    const scheduleIsValid = draft.kind === "REMINDER"
      ? draft.schedule.frequency === "ONCE" && /^\d{4}-\d{2}-\d{2}$/.test(draft.schedule.localDate ?? "")
      : (draft.schedule.frequency === "DAILY" && !draft.schedule.localDate) ||
        (draft.schedule.frequency === "WEEKLY" && !draft.schedule.localDate && draft.schedule.weekdays.length > 0);
    return Boolean(
      draft.name.trim() &&
      (draft.kind === "REMINDER" ? draft.message?.trim() : draft.instruction?.trim()) &&
      /^([01]\d|2[0-3]):[0-5]\d$/.test(draft.schedule.localTime) &&
      timezoneIsValid &&
      scheduleIsValid,
    );
  }, [draft, timezoneIsValid]);

  const setKind = (kind: XiaoBaoScheduledItemKind) => {
    setDraft((current) => ({
      ...current,
      kind,
      instruction: kind === "REMINDER" ? null : current.instruction ?? "",
      message: kind === "REMINDER" ? current.message ?? "" : null,
      schedule: {
        ...current.schedule,
        frequency: kind === "REMINDER" ? "ONCE" : "DAILY",
        localDate: kind === "REMINDER" ? current.schedule.localDate ?? "" : undefined,
        weekdays: [],
      },
    }));
  };

  const setFrequency = (frequency: Exclude<XiaoBaoRoutineFrequency, "ONCE">) => {
    setDraft((current) => ({
      ...current,
      schedule: {
        ...current.schedule,
        frequency,
        localDate: undefined,
        weekdays: frequency === "WEEKLY"
          ? current.schedule.weekdays.length ? current.schedule.weekdays : [0]
          : [],
      },
    }));
  };

  const toggleWeekday = (weekday: XiaoBaoRoutineWeekday) => {
    setDraft((current) => {
      const selected = current.schedule.weekdays.includes(weekday)
        ? current.schedule.weekdays.filter((item) => item !== weekday)
        : [...current.schedule.weekdays, weekday].sort();
      return { ...current, schedule: { ...current.schedule, weekdays: selected } };
    });
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!isValid || isSubmitting) return;
    const schedule = { ...draft.schedule, timezone: draft.schedule.timezone.trim() };
    void onSubmit(draft.kind === "REMINDER" ? {
      kind: "REMINDER",
      name: draft.name.trim(),
      instruction: null,
      message: draft.message?.trim() ?? "",
      schedule,
      contextProfile: draft.contextProfile,
    } : {
      kind: "ROUTINE",
      name: draft.name.trim(),
      instruction: draft.instruction?.trim() ?? "",
      message: null,
      schedule,
      contextProfile: draft.contextProfile,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="scheduled-item-kind">What would you like?</Label>
        <Select value={draft.kind} onValueChange={(value) => setKind(value as XiaoBaoScheduledItemKind)}>
          <SelectTrigger id="scheduled-item-kind"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="REMINDER">One-time reminder</SelectItem>
            <SelectItem value="ROUTINE">Recurring routine</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="routine-name">{draft.kind === "REMINDER" ? "Reminder name" : "Routine name"}</Label>
        <Input
          id="routine-name"
          value={draft.name}
          maxLength={100}
          placeholder={draft.kind === "REMINDER" ? "A gentle nudge" : "A little weekday idea"}
          onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="routine-instruction">{draft.kind === "REMINDER" ? "Reminder text" : "What Xiao Bao should prepare"}</Label>
        <Textarea
          id="routine-instruction"
          value={draft.kind === "REMINDER" ? draft.message ?? "" : draft.instruction ?? ""}
          maxLength={1_000}
          className="min-h-24"
          placeholder={draft.kind === "REMINDER" ? "Plan our cozy mini-date." : "Give me one small thing I can do for my partner today."}
          onChange={(event) => setDraft((current) => current.kind === "REMINDER"
            ? { ...current, message: event.target.value }
            : { ...current, instruction: event.target.value })}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {draft.kind === "ROUTINE" && <div className="space-y-1.5">
          <Label htmlFor="routine-frequency">Repeats</Label>
          <Select value={draft.schedule.frequency} onValueChange={(value) => setFrequency(value as Exclude<XiaoBaoRoutineFrequency, "ONCE">)}>
            <SelectTrigger id="routine-frequency"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="DAILY">Every day</SelectItem>
              <SelectItem value="WEEKLY">Selected weekdays</SelectItem>
            </SelectContent>
          </Select>
        </div>}
        {draft.kind === "REMINDER" && (
          <div className="space-y-1.5">
            <Label htmlFor="routine-date">Date</Label>
            <Input
              id="routine-date"
              type="date"
              value={draft.schedule.localDate ?? ""}
              onChange={(event) => setDraft((current) => ({
                ...current,
                schedule: { ...current.schedule, localDate: event.target.value },
              }))}
            />
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="routine-time">Local time</Label>
          <Input
            id="routine-time"
            type="time"
            value={draft.schedule.localTime}
            onChange={(event) => setDraft((current) => ({
              ...current,
              schedule: { ...current.schedule, localTime: event.target.value },
            }))}
          />
        </div>
      </div>

      {draft.kind === "ROUTINE" && draft.schedule.frequency === "WEEKLY" && (
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Weekdays</legend>
          <div className="flex flex-wrap gap-2">
            {XIAOBAO_WEEKDAYS.map((day) => {
              const selected = draft.schedule.weekdays.includes(day.value);
              return (
                <Button
                  key={day.label}
                  type="button"
                  size="sm"
                  variant={selected ? "default" : "outline"}
                  aria-label={day.label}
                  aria-pressed={selected}
                  onClick={() => toggleWeekday(day.value)}
                >
                  {day.short}
                </Button>
              );
            })}
          </div>
          {draft.schedule.weekdays.length === 0 && (
            <p className="text-xs text-red-600">Choose at least one weekday.</p>
          )}
        </fieldset>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="routine-timezone">Timezone</Label>
        <Input
          id="routine-timezone"
          list="xiaobao-timezones"
          value={draft.schedule.timezone}
          placeholder="Europe/Amsterdam"
          onChange={(event) => setDraft((current) => ({
            ...current,
            schedule: { ...current.schedule, timezone: event.target.value },
          }))}
        />
        <datalist id="xiaobao-timezones">
          {COMMON_TIMEZONES.map((timezone) => <option key={timezone} value={timezone} />)}
        </datalist>
        <p className="text-xs text-muted-foreground">Local time stays consistent when daylight saving time changes.</p>
        {draft.schedule.timezone && !timezoneIsValid && (
          <p className="text-xs text-red-600">Use a valid IANA timezone, such as Europe/Amsterdam.</p>
        )}
      </div>

      <div className="space-y-2 rounded-xl border border-rose-100 bg-rose-50/70 p-3 text-xs text-slate-700">
        <p className="flex items-start gap-2"><LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />Only you can see this {draft.kind === "REMINDER" ? "reminder" : "routine"} and its messages.</p>
        {draft.kind === "REMINDER" ? (
          <p className="flex items-start gap-2"><Eye className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />Xiao Bao will deliver this exact reminder text. It will not use AI or relationship context.</p>
        ) : (
          <p className="flex items-start gap-2"><Eye className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />Xiao Bao may read current relationship context and active Together List items. It cannot add, edit, complete, or delete list items.</p>
        )}
        <p className="flex items-start gap-2"><CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />Messages arrive in your private Xiao Bao inbox. No push notifications yet.</p>
        <p className="flex items-start gap-2"><CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />Event-based triggers, such as an anniversary approaching or a stalled goal, aren’t supported yet. They are separate from reminders and routines.</p>
      </div>

      <Button type="submit" className="w-full" disabled={!isValid || isSubmitting}>
        {isSubmitting ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
