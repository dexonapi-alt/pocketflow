"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Check, Circle, Clock, Trash2, Flag, AlertTriangle, Target, CalendarDays, Wallet, ShoppingBag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SectionEyebrow } from "@/components/shared";
import { useUserTasks, useTaskStats, useCreateTask, useUpdateTask, useDeleteTask } from "@/hooks/use-user-tasks";

const card = "rounded-[28px] border border-black/6 bg-white shadow-[0_1px_0_rgba(0,0,0,0.02),0_18px_40px_rgba(0,0,0,0.035)]";
const inputClass = "h-12 rounded-2xl border border-black/10 bg-white px-4 text-[15px] shadow-none focus-visible:ring-0 focus-visible:ring-offset-0";

const priorityConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  URGENT: { label: "Urgent", color: "bg-[#fff0f2] text-[#d4587b]", icon: AlertTriangle },
  HIGH: { label: "High", color: "bg-[#fff4e8] text-[#df7b2d]", icon: Flag },
  MEDIUM: { label: "Medium", color: "bg-[#eef7ff] text-[#2e7cd6]", icon: Flag },
  LOW: { label: "Low", color: "bg-[#f3f3f1] text-black/50", icon: Flag },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  TODO: { label: "To do", color: "bg-[#f3f3f1] text-black/55" },
  IN_PROGRESS: { label: "In progress", color: "bg-[#eef7ff] text-[#2e7cd6]" },
  DONE: { label: "Done", color: "bg-[#ecfaf1] text-[#27945c]" },
};

export function TaskManagerPage() {
  const [filter, setFilter] = useState<string | undefined>(undefined);
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState("MEDIUM");

  const tasksQuery = useUserTasks(filter);
  const statsQuery = useTaskStats();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const tasks = tasksQuery.data?.data ?? [];
  const stats = statsQuery.data?.data ?? { total: 0, done: 0, inProgress: 0, todo: 0 };
  const completionRate = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    await createTask.mutateAsync({ title: newTitle, priority: newPriority });
    setNewTitle("");
  };

  const cycleStatus = (current: string) => {
    const order = ["TODO", "IN_PROGRESS", "DONE"];
    const next = order[(order.indexOf(current) + 1) % order.length];
    return next;
  };

  return (
    <div className="space-y-6">
      {/* ─── Stats Row ─── */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Total", value: stats.total, tone: "bg-[#f3f3f1] text-black" },
          { label: "To do", value: stats.todo, tone: "bg-[#eef7ff] text-[#2e7cd6]" },
          { label: "In progress", value: stats.inProgress, tone: "bg-[#fff4e8] text-[#df7b2d]" },
          { label: "Done", value: stats.done, tone: "bg-[#ecfaf1] text-[#27945c]" },
        ].map((s) => (
          <div key={s.label} className="rounded-[22px] border border-black/6 bg-[#fcfcfb] p-4">
            <p className="text-sm text-black/42">{s.label}</p>
            <p className="mt-1 text-[24px] font-semibold tracking-[-0.03em]">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
        {/* ─── Add Task + Progress ─── */}
        <div className="space-y-6">
          <Card className={card}>
            <CardHeader>
              <SectionEyebrow>New task</SectionEyebrow>
              <CardTitle className="mt-2">Add task</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input className={inputClass} placeholder="Task title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleCreate()} />
              <div className="flex gap-2">
                {(["LOW", "MEDIUM", "HIGH", "URGENT"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setNewPriority(p)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                      newPriority === p ? priorityConfig[p].color : "bg-black/[0.03] text-black/38"
                    }`}
                  >
                    {priorityConfig[p].label}
                  </button>
                ))}
              </div>
              <Button onClick={handleCreate} disabled={createTask.isPending} className="h-11 w-full rounded-2xl bg-black text-white">
                <Plus className="mr-2 h-4 w-4" /> {createTask.isPending ? "Adding..." : "Add task"}
              </Button>
            </CardContent>
          </Card>

          <Card className={card}>
            <CardContent className="p-6">
              <SectionEyebrow>Progress</SectionEyebrow>
              <p className="mt-2 text-[34px] font-semibold tracking-[-0.04em]">{completionRate}%</p>
              <div className="mt-3 h-2.5 rounded-full bg-black/6">
                <motion.div initial={{ width: 0 }} animate={{ width: `${completionRate}%` }} transition={{ duration: 0.5 }} className="h-2.5 rounded-full bg-[#27945c]" />
              </div>
              <p className="mt-2 text-sm text-black/42">{stats.done} of {stats.total} tasks completed</p>
            </CardContent>
          </Card>
        </div>

        {/* ─── Task List ─── */}
        <Card className={card}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <SectionEyebrow>Tasks</SectionEyebrow>
                <CardTitle className="mt-2">Your tasks</CardTitle>
              </div>
              <div className="flex gap-2">
                {[
                  { key: undefined, label: "All" },
                  { key: "TODO", label: "To do" },
                  { key: "IN_PROGRESS", label: "Active" },
                  { key: "DONE", label: "Done" },
                ].map((f) => (
                  <button
                    key={f.label}
                    onClick={() => setFilter(f.key)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                      filter === f.key ? "bg-black text-white" : "bg-[#f3f3f1] text-black/55"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {tasks.length === 0 && (
              <p className="py-8 text-center text-sm text-black/38">No tasks yet. Create your first one!</p>
            )}
            {tasks.map((task) => {
              const pri = priorityConfig[task.priority] ?? priorityConfig.MEDIUM;
              const sta = statusConfig[task.status] ?? statusConfig.TODO;
              const isDone = task.status === "DONE";
              const isGoalTask = task.description?.startsWith("Purchase goal:");

              if (isGoalTask) {
                const dueDateStr = task.dueDate
                  ? new Date(task.dueDate).toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" })
                  : null;

                const goalSteps = [
                  { key: "TODO", label: "Planned", icon: Target, color: "text-[#7357d8]", bg: "bg-[#f6f3ff]", ring: "ring-[#7357d8]" },
                  { key: "IN_PROGRESS", label: "Saving for it", icon: Wallet, color: "text-[#df7b2d]", bg: "bg-[#fff4e8]", ring: "ring-[#df7b2d]" },
                  { key: "DONE", label: "Bought it!", icon: ShoppingBag, color: "text-[#27945c]", bg: "bg-[#ecfaf1]", ring: "ring-[#27945c]" },
                ];
                const currentIdx = goalSteps.findIndex((s) => s.key === task.status);
                const currentStep = goalSteps[currentIdx] ?? goalSteps[0];

                return (
                  <div key={task.id} className={`rounded-[22px] border p-4 transition ${isDone ? "border-[#27945c]/20 bg-[#ecfaf1]/20" : "border-[#7357d8]/15 bg-gradient-to-r from-[#f6f3ff]/40 to-[#fcfcfb]"}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <button
                          onClick={() => updateTask.mutate({ id: task.id, status: cycleStatus(task.status) })}
                          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition ${currentStep.bg} ${currentStep.color} hover:ring-2 ${currentStep.ring}/30`}
                          title={`Next: ${goalSteps[(currentIdx + 1) % goalSteps.length].label}`}
                        >
                          <currentStep.icon className="h-4 w-4" />
                        </button>
                        <div className="min-w-0">
                          <p className={`text-[15px] font-semibold ${isDone ? "line-through text-black/40" : "text-black"}`}>{task.title}</p>
                          <p className="mt-0.5 text-sm text-black/45 font-medium">{task.description}</p>

                          {/* Progress steps */}
                          <div className="mt-3 flex items-center gap-1">
                            {goalSteps.map((step, idx) => {
                              const isActive = idx <= currentIdx;
                              const StepIcon = step.icon;
                              return (
                                <div key={step.key} className="flex items-center gap-1">
                                  {idx > 0 && (
                                    <div className={`h-[2px] w-4 rounded-full transition ${isActive ? "bg-[#27945c]" : "bg-black/10"}`} />
                                  )}
                                  <div
                                    className={`flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium transition ${
                                      isActive ? `${step.bg} ${step.color}` : "bg-black/[0.03] text-black/30"
                                    }`}
                                  >
                                    <StepIcon className="h-3 w-3" />
                                    <span className="hidden sm:inline">{step.label}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {dueDateStr && (
                            <div className="mt-2">
                              <Badge className="rounded-full border-0 bg-[#f6f3ff] px-2.5 py-0.5 text-[11px] text-[#7357d8] hover:bg-[#f6f3ff]">
                                <CalendarDays className="mr-1 h-3 w-3" /> {dueDateStr}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                      <button onClick={() => deleteTask.mutate(task.id)} className="rounded-xl p-2 text-black/20 hover:bg-black/[0.04] hover:text-[#d4587b]">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div key={task.id} className={`flex items-center justify-between rounded-[22px] border border-black/6 p-4 transition ${isDone ? "bg-[#fcfcfb] opacity-60" : "bg-[#fcfcfb] hover:bg-white"}`}>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateTask.mutate({ id: task.id, status: cycleStatus(task.status) })}
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${
                        isDone ? "border-[#27945c] bg-[#ecfaf1] text-[#27945c]" : "border-black/15 text-black/20 hover:border-black/30"
                      }`}
                    >
                      {isDone ? <Check className="h-3.5 w-3.5" /> : task.status === "IN_PROGRESS" ? <Clock className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
                    </button>
                    <div>
                      <p className={`text-[15px] font-medium ${isDone ? "line-through text-black/40" : "text-black"}`}>{task.title}</p>
                      {task.description && (
                        <p className="mt-0.5 text-sm text-black/40">{task.description}</p>
                      )}
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <Badge className={`rounded-full px-2 py-0.5 text-[11px] ${pri.color}`}>{pri.label}</Badge>
                        <Badge className={`rounded-full px-2 py-0.5 text-[11px] ${sta.color}`}>{sta.label}</Badge>
                        {task.dueDate && (
                          <Badge className="rounded-full border-0 bg-[#f3f3f1] px-2 py-0.5 text-[11px] text-black/50 hover:bg-[#f3f3f1]">
                            <CalendarDays className="mr-1 h-3 w-3" /> {new Date(task.dueDate).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => deleteTask.mutate(task.id)} className="rounded-xl p-2 text-black/20 hover:bg-black/[0.04] hover:text-[#d4587b]">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
