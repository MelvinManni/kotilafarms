# Roles, access and the audit trail

Login by email and password. No public sign-up: an owner creates each account and picks its role.

## What each role sees

| Area | Owner | Manager | Recorder |
| --- | --- | --- | --- |
| Today (dashboard) | Full, with money | Full, with money (no capital or loans) | Sets, today's logs, what's due. No money |
| Daily log, weights | ✓ | ✓ | ✓ |
| Sets list and detail | ✓ | ✓ | Read-only counts, no money |
| Feed, health, sales, buyers, expenses | ✓ | ✓ | — |
| Finance: cash position, Set P&L | ✓ | Cash position and Set P&L | — |
| Finance: partner capital, shareholder loans, settlement | ✓ | — | — |
| Reports | ✓ | ✓ (without capital) | — |
| Settings: users and roles | ✓ | — | — |
| Settings: feed types, categories, buyers, vaccine schedule, breed curve | ✓ | ✓ | — |

**Hide, don't disable.** Items a role can't use are removed from navigation (`SideRail` filters by `roles`). A deep link to a hidden screen shows an `EmptyState`: *This is for owners. Ask Kosi if you need these figures.*

Recorders use the phone app only: `TabBar` with Today, Log, Weigh, History.

## Who entered it

Every record shows its author and time in a caption: *Logged by Chinedu · Thu 24 Sep, 6:40pm*. Offline entries add *· sent Fri 7:02am*.

## Edit history

Every record has a history icon (`IconButton` icon `history`, tooltip *Edit history*) that opens a `Sheet` with an `AuditTrail`:

- who changed it, their role, when, on which device
- the field, the old value struck through, the new value in bold
- the reason, when given. A reason is **required** when changing a count or an amount after the day it was for: *Why are you changing this?*

Deleting a sale, expense or log is an owner-only action and keeps a tombstone in history: *Kosi deleted this sale (₦215,000 to Mama Nkechi) — duplicate of 12 Sep entry*.

## Invitations

An owner invites by email and picks a role; the invitee sets a password on a page that says who added them and what the role allows. Owners can change roles and deactivate people; deactivated people's records keep their name.
