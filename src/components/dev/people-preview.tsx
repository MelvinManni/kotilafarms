// Dev preview: people, roles, edit history
import { AuditTrail } from "@/components/kotila/audit-trail";
import { Person } from "@/components/kotila/person";
import { RoleBadge } from "@/components/kotila/role-badge";
import { PreviewSection } from "@/components/dev/preview-section";

export function PeoplePreview() {
  return (
    <PreviewSection title="People and history">
      <div className="flex flex-wrap items-center gap-6">
        <Person name="Kosi" role="owner" size="lg" />
        <Person name="Adaeze Nwankwo" role="manager" />
        <Person name="Chinedu Okafor" meta="Logged Set 4 at 6:40pm" size="sm" />
        <RoleBadge role="owner" />
        <RoleBadge role="manager" />
        <RoleBadge role="recorder" />
      </div>
      <div className="max-w-xl rounded-xl border border-line bg-surface p-6">
        <AuditTrail
          entries={[
            { who: "Adaeze Nwankwo", role: "manager", when: "Sat 26 Sep, 8:10am", field: "deaths", from: 2, to: 4, note: "Two more found under the drinker line this morning." },
            { who: "Chinedu Okafor", role: "recorder", when: "Fri 25 Sep, 6:40pm", action: "logged", field: "Set 4, Fri 25 Sep", device: "Entered offline" },
          ]}
        />
      </div>
    </PreviewSection>
  );
}
