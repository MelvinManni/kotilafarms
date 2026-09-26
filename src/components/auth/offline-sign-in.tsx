// No signal: the last person on this device can carry on; anyone else needs a connection
import { Button } from "@/components/kotila/button";
import { Notice } from "@/components/kotila/notice";
import { Person } from "@/components/kotila/person";
import type { RememberedUser } from "@/lib/offline/remembered-user";
import { ROLE_LABEL } from "@/types/role";
import { clockTime, farmDay } from "@/utils/format/dates";
import { todayInZone } from "@/utils/dates/today-in-zone";

export function OfflineSignIn({ user }: { user: RememberedUser }) {
  const first = user.name.split(" ")[0];
  const last = new Date(user.lastOnlineAt);
  return (
    <div className="flex w-full max-w-105 flex-col gap-5">
      <h2 className="m-0 font-display text-title-lg font-semibold">Welcome back, {first}.</h2>
      <Notice tone="warning" icon="wifi-off" title="No signal">
        You can keep working as {first} on this device. Signing in as someone else needs a connection.
      </Notice>
      <div className="rounded-lg bg-surface p-4 shadow-raise">
        <Person name={user.name} size="lg" meta={`${ROLE_LABEL[user.role]} · last online ${farmDay(todayInZone("Africa/Lagos", last))}, ${clockTime(last)}`} />
      </div>
      <Button variant="primary" size="xl" full href="/today">
        Open offline
      </Button>
      <div className="flex flex-col items-center gap-2">
        <Button full disabled>
          Sign in as someone else
        </Button>
        <span className="text-caption text-ink-muted">Available when you’re back online</span>
      </div>
    </div>
  );
}
