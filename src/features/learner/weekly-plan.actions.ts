"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export interface PlannedBlock {
  id: string;
  title: string;
  minutes: number;
  contentType: string;
  isMilestone: boolean;
  isQuickWin: boolean;
}

export interface PlannedDay {
  label: string;
  date: string;
  totalMinutes: number;
  capacityMinutes: number;
  blocks: PlannedBlock[];
  isToday: boolean;
}

export interface WeeklyPlanResult {
  weekStart: string;
  weeklyHours: number;
  dailyCapacity: number;
  totalPlanned: number;
  days: PlannedDay[];
  leftover: number;
}

const DAY_LABELS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

function startOfWeek(d = new Date()) {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  const day = date.getDay();
  date.setDate(date.getDate() - day);
  return date;
}

export async function getWeeklyPlanAction(): Promise<
  { ok: true; data: WeeklyPlanResult } | { ok: false; error: string }
> {
  const session = await getSession();
  if (!session || session.role !== "LEARNER") return { ok: false, error: "Sesi tidak valid." };

  try {
    const profile = await db.learnerProfile.findUnique({
      where: { userId: session.userId },
      select: { id: true, weeklyHours: true },
    });
    if (!profile) return { ok: false, error: "Profil tidak ditemukan." };

    const weeklyHours = profile.weeklyHours || 5;

    const items = await db.learningPathItem.findMany({
      where: { path: { learnerId: profile.id }, isCompleted: false },
      orderBy: [{ isMilestone: "desc" }, { sortOrder: "asc" }],
      take: 20,
      include: {
        module: { select: { title: true, estimatedMinutes: true, contentType: true } },
      },
    });

    const pool: PlannedBlock[] = items.map((i) => ({
      id: i.id,
      title: i.module.title,
      minutes: i.module.estimatedMinutes || 45,
      contentType: i.module.contentType,
      isMilestone: i.isMilestone,
      isQuickWin: i.isQuickWin,
    }));

    if (pool.length === 0) {
      const fallback = [
        { id: "s1", title: "Review skill gap prioritas", minutes: 30, contentType: "ARTICLE", isMilestone: false, isQuickWin: true },
        { id: "s2", title: "Daily challenge + refleksi", minutes: 20, contentType: "QUIZ", isMilestone: false, isQuickWin: true },
        { id: "s3", title: "Deep work 1 topik utama", minutes: 60, contentType: "INTERACTIVE", isMilestone: true, isQuickWin: false },
        { id: "s4", title: "Latih 1 konsep lewat project mini", minutes: 90, contentType: "PROJECT", isMilestone: false, isQuickWin: false },
        { id: "s5", title: "Sesi mentoring / peer discussion", minutes: 45, contentType: "WORKSHOP", isMilestone: true, isQuickWin: false },
      ];
      pool.push(...fallback);
    }

    const totalMinutesBudget = weeklyHours * 60;
    const dailyCapacity = Math.ceil(totalMinutesBudget / 5); // 5 active days
    const start = startOfWeek();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().slice(0, 10);

    const days: PlannedDay[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const weekday = d.getDay();
      const isWeekend = weekday === 0 || weekday === 6;
      days.push({
        label: DAY_LABELS[weekday],
        date: d.toISOString().slice(0, 10),
        totalMinutes: 0,
        capacityMinutes: isWeekend ? Math.round(dailyCapacity * 0.4) : dailyCapacity,
        blocks: [],
        isToday: d.toISOString().slice(0, 10) === todayStr,
      });
    }

    const queue = [...pool].sort((a, b) => {
      if (a.isMilestone !== b.isMilestone) return a.isMilestone ? -1 : 1;
      if (a.isQuickWin !== b.isQuickWin) return a.isQuickWin ? -1 : 1;
      return a.minutes - b.minutes;
    });

    for (const day of days) {
      while (queue.length > 0) {
        const candidateIdx = queue.findIndex((b) => day.totalMinutes + b.minutes <= day.capacityMinutes);
        if (candidateIdx === -1) break;
        const block = queue[candidateIdx];
        day.blocks.push(block);
        day.totalMinutes += block.minutes;
        queue.splice(candidateIdx, 1);
      }
    }

    const totalPlanned = days.reduce((s, d) => s + d.totalMinutes, 0);
    const leftover = queue.reduce((s, b) => s + b.minutes, 0);

    return {
      ok: true,
      data: {
        weekStart: start.toISOString().slice(0, 10),
        weeklyHours,
        dailyCapacity,
        totalPlanned,
        days,
        leftover,
      },
    };
  } catch (err) {
    console.error("getWeeklyPlanAction error", err);
    return { ok: false, error: "Gagal menyusun rencana." };
  }
}
