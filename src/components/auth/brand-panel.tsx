// Green brand side of the sign-in screen (desktop); a compact band on phones
import { KotilaIcon } from "@/svgs/kotila-icon";
import { KotilaMark } from "@/svgs/kotila-mark";
import { Icon } from "@/svgs/icon";

export function BrandPanel() {
  return (
    <section className="relative flex flex-col justify-between gap-8 overflow-hidden bg-green-700 px-6 py-8 text-white lg:min-h-dvh lg:w-[53%] lg:px-16 lg:py-14">
      <KotilaMark color="white" className="pointer-events-none absolute -right-75 -bottom-55 w-245 opacity-9" />
      <div className="relative flex items-center gap-3.5">
        <KotilaIcon className="w-11 lg:w-13" title="Kotila Farms" />
        <div className="font-display text-[26px] leading-none tracking-[-0.02em] lg:text-[30px]">
          <span className="font-semibold">Kotila</span> <span className="font-light">Farms</span>
        </div>
      </div>
      <div className="relative flex max-w-135 flex-col gap-5">
        <h1 className="m-0 font-display text-[34px] leading-[1.05] font-semibold tracking-[-0.025em] lg:text-display-xl">The farm’s books, kept every day.</h1>
        <p className="m-0 text-body-lg text-[#e4f0da] lg:text-lg lg:leading-relaxed">
          Daily logs, feed, weights, sales and money for every Set — entered from the pen, checked from anywhere.
        </p>
      </div>
      <div className="relative hidden items-center gap-2 text-sm text-[#d6e8c8] lg:flex">
        <Icon name="wifi-off" size={18} color="var(--yellow-500)" />
        <span>Keeps working with no signal once you’ve signed in on a device</span>
      </div>
    </section>
  );
}
