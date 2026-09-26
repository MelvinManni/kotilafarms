// Placeholder home until the Today screen lands (P1.7)
import { KotilaIcon } from "@/svgs/kotila-icon";

export default function HomePage() {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <h1 className="flex items-center gap-3 text-display-sm">
        <KotilaIcon className="w-12" />
        <span>
          <span className="font-semibold text-ink">Kotila</span>{" "}
          <span className="font-light text-green-700">Farms</span>
        </span>
      </h1>
    </main>
  );
}
