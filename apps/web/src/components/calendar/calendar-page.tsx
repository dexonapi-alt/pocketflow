"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus, Pin, X, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SectionEyebrow } from "@/components/shared";
import { usePlannerMonth, useCreateEvent, useDeleteEvent } from "@/hooks/use-planner";

const card = "rounded-[28px] border border-black/6 bg-white shadow-[0_1px_0_rgba(0,0,0,0.02),0_18px_40px_rgba(0,0,0,0.035)]";
const inputClass = "h-12 rounded-2xl border border-black/10 bg-white px-4 text-[15px] shadow-none focus-visible:ring-0 focus-visible:ring-offset-0";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const COLORS = ["#2e7cd6", "#27945c", "#df7b2d", "#7357d8", "#d4587b", "#d96f42"];
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function CalendarPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newColor, setNewColor] = useState(COLORS[0]);

  const eventsQuery = usePlannerMonth(year, month);
  const createEvent = useCreateEvent();
  const deleteEvent = useDeleteEvent();

  const events = eventsQuery.data?.data ?? [];

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }, [year, month]);

  // Events by day
  const eventsByDay = useMemo(() => {
    const map: Record<number, typeof events> = {};
    events.forEach((e) => {
      const d = new Date(e.date).getDate();
      if (!map[d]) map[d] = [];
      map[d].push(e);
    });
    return map;
  }, [events]);

  const selectedEvents = selectedDate
    ? events.filter((e) => new Date(e.date).toISOString().split("T")[0] === selectedDate)
    : [];

  const goMonth = (delta: number) => {
    let m = month + delta;
    let y = year;
    if (m > 12) { m = 1; y++; }
    if (m < 1) { m = 12; y--; }
    setMonth(m);
    setYear(y);
    setSelectedDate(null);
  };

  const handleAdd = async () => {
    if (!newTitle || !selectedDate) return;
    await createEvent.mutateAsync({
      title: newTitle,
      description: newDesc || undefined,
      date: new Date(selectedDate).toISOString(),
      color: newColor,
      pinned: true,
    });
    setNewTitle("");
    setNewDesc("");
    setShowAdd(false);
  };

  const today = new Date();
  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() + 1 && year === today.getFullYear();

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      {/* ─── Calendar Grid ─── */}
      <Card className={card}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <SectionEyebrow>Calendar</SectionEyebrow>
              <CardTitle className="mt-2">{MONTH_NAMES[month - 1]} {year}</CardTitle>
            </div>
            <div className="flex gap-2">
              <button onClick={() => goMonth(-1)} className="flex h-10 w-10 items-center justify-center rounded-2xl border border-black/8 bg-white hover:bg-black/[0.02]">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={() => goMonth(1)} className="flex h-10 w-10 items-center justify-center rounded-2xl border border-black/8 bg-white hover:bg-black/[0.02]">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1">
            {DAYS.map((d) => (
              <div key={d} className="py-2 text-center text-xs font-medium text-black/38">{d}</div>
            ))}
            {calendarDays.map((day, i) => {
              if (day === null) return <div key={`e-${i}`} />;
              const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const dayEvents = eventsByDay[day] || [];
              const isSelected = selectedDate === dateStr;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`relative flex min-h-[68px] flex-col items-center rounded-2xl p-1.5 transition ${
                    isSelected ? "bg-black text-white" : isToday(day) ? "bg-[#eef7ff] text-[#2e7cd6]" : "hover:bg-black/[0.03]"
                  }`}
                >
                  <span className={`text-sm font-medium ${isSelected ? "text-white" : ""}`}>{day}</span>
                  {dayEvents.length > 0 && (
                    <div className="mt-1 flex gap-0.5">
                      {dayEvents.slice(0, 3).map((e) => (
                        <div key={e.id} className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: e.color ?? "#2e7cd6" }} />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ─── Day Detail / Add Event ─── */}
      <Card className={card}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <SectionEyebrow>{selectedDate ? "Events" : "Select a date"}</SectionEyebrow>
              <CardTitle className="mt-2">
                {selectedDate ? new Date(selectedDate + "T00:00:00").toLocaleDateString("en-PH", { weekday: "long", month: "long", day: "numeric" }) : "Planner"}
              </CardTitle>
            </div>
            {selectedDate && (
              <Button onClick={() => setShowAdd(!showAdd)} size="icon" className="h-10 w-10 rounded-2xl bg-black text-white">
                {showAdd ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <AnimatePresence>
            {showAdd && selectedDate && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-3 overflow-hidden">
                <Input className={inputClass} placeholder="Event title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
                <Input className={inputClass} placeholder="Description (optional)" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
                <div className="flex items-center gap-2">
                  {COLORS.map((c) => (
                    <button key={c} onClick={() => setNewColor(c)} className={`h-7 w-7 rounded-full border-2 ${newColor === c ? "border-black" : "border-transparent"}`} style={{ backgroundColor: c }} />
                  ))}
                </div>
                <Button onClick={handleAdd} disabled={createEvent.isPending} className="h-11 w-full rounded-2xl bg-black text-white">
                  {createEvent.isPending ? "Adding..." : "Pin to this date"}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {!selectedDate && (
            <p className="py-8 text-center text-sm text-black/38">Click a date on the calendar to see or add events.</p>
          )}

          {selectedDate && selectedEvents.length === 0 && !showAdd && (
            <p className="py-8 text-center text-sm text-black/38">No events pinned to this date.</p>
          )}

          {selectedEvents.map((e) => (
            <div key={e.id} className="flex items-start justify-between rounded-[22px] border border-black/6 bg-[#fcfcfb] p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: e.color ?? "#2e7cd6" }} />
                <div>
                  <p className="text-[15px] font-medium text-black">{e.title}</p>
                  {e.description && <p className="mt-1 text-sm text-black/42">{e.description}</p>}
                  {e.pinned && (
                    <Badge className="mt-2 rounded-full border-0 bg-[#fff4e8] px-2 py-0.5 text-[11px] text-[#df7b2d]">
                      <Pin className="mr-1 h-3 w-3" /> Pinned
                    </Badge>
                  )}
                </div>
              </div>
              <button onClick={() => deleteEvent.mutate(e.id)} className="rounded-xl p-2 text-black/30 hover:bg-black/[0.04] hover:text-[#d4587b]">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
