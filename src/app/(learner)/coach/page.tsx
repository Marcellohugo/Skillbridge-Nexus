"use client";

import * as React from "react";
import Link from "next/link";
import { Badge, Button, Card, CardHeader } from "@/components/ui";
import { coachChatAction, type CoachReply } from "@/features/learner/coach.actions";

type Msg =
  | { role: "user"; text: string }
  | { role: "coach"; reply: CoachReply };

const INTRO: CoachReply = {
  ok: true,
  intent: "general",
  reply:
    "Halo! Aku **Nexus Coach** — asisten karir kamu di SkillBridge. Aku baca profil, TRI, skill gap, dan progress kamu untuk memberi saran personal. Pilih chip di bawah atau ketik pertanyaan langsung.",
  suggestions: [
    { label: "Lihat dashboard", href: "/dashboard" },
    { label: "Ambil asesmen", href: "/assessment" },
  ],
  chips: [
    "Apa langkah saya selanjutnya?",
    "Skill mana yang paling lemah?",
    "Kapan saya Career Ready?",
    "Saya sedang stuck, apa yang harus dilakukan?",
  ],
};

export default function CoachPage() {
  const [messages, setMessages] = React.useState<Msg[]>([{ role: "coach", reply: INTRO }]);
  const [input, setInput] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setMessages((m) => [...m, { role: "user", text: trimmed }]);
    setInput("");
    setSending(true);
    const res = await coachChatAction(trimmed);
    if (res.ok) {
      setMessages((m) => [...m, { role: "coach", reply: res }]);
    } else {
      setMessages((m) => [
        ...m,
        {
          role: "coach",
          reply: { ok: true, intent: "error", reply: `Maaf, ${res.error}`, suggestions: [], chips: [] },
        },
      ]);
    }
    setSending(false);
  };

  const lastChips =
    [...messages].reverse().find((m) => m.role === "coach")?.reply.chips ?? [];

  return (
    <div className="container-app py-8 lg:py-10 stack-xl stack">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="eyebrow">AI Coach</span>
          <h1 className="mt-2 text-3xl sm:text-4xl font-display font-bold">Nexus Coach</h1>
          <p className="mt-1 text-foreground-secondary">
            Coach kontekstual yang membaca profil, gap, dan progres kamu — untuk saran personal yang relevan.
          </p>
        </div>
        <Badge tone="brand">Personalized · Live</Badge>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
        <Card elevated className="flex flex-col" style={{ minHeight: "520px" }}>
          <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pr-1" style={{ maxHeight: "60vh" }}>
            {messages.map((m, i) =>
              m.role === "user" ? (
                <UserBubble key={i} text={m.text} />
              ) : (
                <CoachBubble key={i} reply={m.reply} />
              ),
            )}
            {sending && <CoachTyping />}
          </div>

          {lastChips.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {lastChips.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => send(c)}
                  disabled={sending}
                  className="chip hover:border-primary/50 hover:text-foreground transition-colors disabled:opacity-50"
                >
                  💡 {c}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="mt-4 flex items-center gap-2"
          >
            <input
              className="input flex-1"
              placeholder="Tanyakan apa saja tentang karir, skill, atau rencana belajarmu…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={sending}
              aria-label="Pesan ke coach"
            />
            <Button type="submit" disabled={sending || !input.trim()}>
              {sending ? "…" : "Kirim →"}
            </Button>
          </form>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Cara coach bekerja" />
            <ul className="space-y-2.5 text-sm">
              {[
                ["🧠", "Membaca TRI, milestone, dan gap kritis kamu."],
                ["🎯", "Menyelaraskan saran dengan target peran kamu."],
                ["📚", "Merujuk modul aktif di learning path."],
                ["🤝", "Menyarankan mentor sesuai area lemah."],
              ].map(([icon, t]) => (
                <li key={t} className="flex gap-2.5">
                  <span className="text-base">{icon}</span>
                  <span className="text-foreground-secondary">{t}</span>
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <CardHeader title="Privasi" />
            <p className="text-sm text-foreground-secondary">
              Coach berjalan di server kamu sendiri. Percakapan tidak dikirim ke pihak ketiga; balasan dihitung dari data profil yang sudah tersimpan di akunmu.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[80%] rounded-2xl rounded-br-md bg-primary text-white px-4 py-3 shadow-sm text-sm whitespace-pre-wrap">
        {text}
      </div>
    </div>
  );
}

function CoachBubble({ reply }: { reply: CoachReply }) {
  return (
    <div className="flex gap-3">
      <div className="h-9 w-9 rounded-full bg-linear-to-br from-primary to-[#1E40AF] grid place-items-center text-white text-xs font-bold shrink-0">
        NC
      </div>
      <div className="flex-1 space-y-2">
        <div className="inline-block max-w-[90%] rounded-2xl rounded-tl-md bg-background-secondary border border-border px-4 py-3 text-sm">
          <Markdownish text={reply.reply} />
        </div>
        {reply.suggestions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {reply.suggestions.map((s) => (
              <Link key={s.href} href={s.href} className="chip hover:border-primary/50 hover:text-foreground transition-colors">
                ↗ {s.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CoachTyping() {
  return (
    <div className="flex gap-3">
      <div className="h-9 w-9 rounded-full bg-linear-to-br from-primary to-[#1E40AF] grid place-items-center text-white text-xs font-bold shrink-0">
        NC
      </div>
      <div className="inline-flex items-center gap-1.5 rounded-2xl rounded-tl-md bg-background-secondary border border-border px-4 py-3">
        <Dot delay={0} />
        <Dot delay={150} />
        <Dot delay={300} />
      </div>
    </div>
  );
}

function Dot({ delay }: { delay: number }) {
  return (
    <span
      className="h-2 w-2 rounded-full bg-foreground-muted animate-pulse"
      style={{ animationDelay: `${delay}ms` }}
    />
  );
}

function Markdownish({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**") ? (
          <strong key={i} className="text-foreground">{p.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}
