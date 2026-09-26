"use client";
// /today: the owner/manager dashboard or the recorder's phone view, from /api/today
import { useSession } from "next-auth/react";
import { ManagerToday } from "@/components/today/manager-today";
import { RecorderToday } from "@/components/today/recorder-today";
import { Notice } from "@/components/kotila/notice";
import { useToday } from "@/hooks/queries/use-today";

export function TodayScreen() {
  const role = useSession().data?.user.role;
  const today = useToday();
  if (today.isError) return <Notice tone="alert" action={{ label: "Try again", onClick: () => today.refetch() }}>{today.error.message}</Notice>;
  if (!today.data || !role) return <p className="text-body text-on-deep-muted lg:text-ink-muted">Loading today…</p>;
  return role === "recorder" ? <RecorderToday data={today.data} /> : <ManagerToday data={today.data} />;
}
