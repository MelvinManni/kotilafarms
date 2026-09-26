// Signed-out pages: brand panel beside the content; signed-in people go straight to Today
import { redirect } from "next/navigation";
import { BrandPanel } from "@/components/auth/brand-panel";
import { getSessionUser } from "@/server/auth";

export default async function AuthLayout({ children }: LayoutProps<"/">) {
  if (await getSessionUser()) redirect("/today");
  return (
    <div className="flex min-h-dvh flex-col bg-surface lg:flex-row">
      <BrandPanel />
      <main className="relative flex grow flex-col items-center justify-center px-4 py-10 lg:px-10">
        {children}
        <div className="mt-10 flex items-center gap-2 text-caption text-ink-muted lg:absolute lg:bottom-8">
          <span className="size-2 rounded-full bg-green-600" aria-hidden />
          <span>Kotila Farms Ltd · internal use</span>
        </div>
      </main>
    </div>
  );
}
