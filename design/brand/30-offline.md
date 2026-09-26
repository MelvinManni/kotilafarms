# Offline and sync

Signal on the farm is unreliable. Offline is a normal working state, designed as carefully as online.

## States

| State | `SyncStatus` text | Where | Meaning for the person |
| --- | --- | --- | --- |
| Synced | *All synced · 2 min ago* | Rail foot (desktop), hidden or pill on phone | Everything on this device has reached the farm records |
| Offline | *Offline · 3 waiting* | Phone top bar, always visible | Keep working. Entries are saved on the phone and will send by themselves |
| Syncing | *Sending 3 entries…* | Same place | Signal is back; entries are going out |
| Conflict | *1 entry needs a look* | Same place + a Notice on the affected record | Someone changed the same record while you were offline; choose which to keep |

Always words plus colour; the tooltip explains what to do.

## Rules

1. **Every entry saves locally first**, then queues. The save confirmation never waits for the network: *Saved on this phone · will send when signal returns*.
2. **Queued entries are marked** in lists with a `Tag` (dot) *On this phone*, and on desktop other users see *Friday's Set 4 log is on Chinedu's phone, waiting for signal* rather than a gap.
3. **Sign-in offline:** the last person who signed in on the device can open it offline (their session is kept). Signing in as someone else needs a connection and says so.
4. **Skipped days are named, not hidden.** On the next visit: *Set 5 has no log for Friday* with **Fill in Friday**. A backfilled entry records both the day it is for and the moment it was entered.
5. **Conflicts are rare and explicit.** Daily logs are one record per Set per day; if two people log the same day, show both side by side in a Sheet and let a manager keep one. Never merge counts silently.
6. **Money screens (capital, loans, settlement) are online-only.** They show a Notice explaining why when opened offline.

## What never happens

- A toast that disappears and leaves the person unsure if their entry was kept.
- A spinner that blocks entry while waiting for the network.
- Data from another device overwriting a local entry without a trail.
