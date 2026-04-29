"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  actionUrl: string | null;
  createdAt: string;
}

export async function listNotificationsAction(): Promise<
  { ok: true; items: NotificationItem[]; unread: number } | { ok: false; error: string }
> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Tidak ada sesi." };

  try {
    const rows = await db.notification.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    const items: NotificationItem[] = rows.map((r) => ({
      id: r.id,
      type: r.type,
      title: r.title,
      message: r.message,
      isRead: r.isRead,
      actionUrl: r.actionUrl,
      createdAt: r.createdAt.toISOString(),
    }));
    const unread = items.filter((i) => !i.isRead).length;
    return { ok: true, items, unread };
  } catch (err) {
    console.error("listNotificationsAction error", err);
    return { ok: false, error: "Gagal memuat notifikasi." };
  }
}

export async function markNotificationReadAction(id: string) {
  const session = await getSession();
  if (!session) return { ok: false as const, error: "Tidak ada sesi." };

  try {
    await db.notification.updateMany({
      where: { id, userId: session.userId },
      data: { isRead: true },
    });
    revalidatePath("/");
    return { ok: true as const };
  } catch (err) {
    console.error("markNotificationReadAction error", err);
    return { ok: false as const, error: "Gagal menandai." };
  }
}

export async function markAllNotificationsReadAction() {
  const session = await getSession();
  if (!session) return { ok: false as const, error: "Tidak ada sesi." };

  try {
    await db.notification.updateMany({
      where: { userId: session.userId, isRead: false },
      data: { isRead: true },
    });
    revalidatePath("/");
    return { ok: true as const };
  } catch (err) {
    console.error("markAllNotificationsReadAction error", err);
    return { ok: false as const, error: "Gagal menandai semua." };
  }
}
