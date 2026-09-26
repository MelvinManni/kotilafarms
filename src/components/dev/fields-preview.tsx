"use client";
// Dev preview: text, money, select, checkbox, linked amounts
import { Checkbox } from "@/components/kotila/fields/checkbox";
import { MoneyInput } from "@/components/kotila/fields/money-input";
import { Select } from "@/components/kotila/fields/select";
import { TextInput } from "@/components/kotila/fields/text-input";
import { LinkedAmounts } from "@/components/kotila/linked-amounts";
import { PreviewSection } from "@/components/dev/preview-section";

export function FieldsPreview() {
  return (
    <PreviewSection title="Fields">
      <div className="grid gap-5 sm:grid-cols-2">
        <TextInput label="Description" placeholder="Diesel for the generator" hint="What was bought, in a few words" />
        <TextInput label="Temperature" optional suffix="°C" inputMode="decimal" defaultValue="31" />
        <MoneyInput label="Amount" required defaultValue={12000} />
        <MoneyInput label="Deposit" error="Deposit can't be more than the total." defaultValue={400000} />
        <Select label="Category" required placeholder="Choose a category" options={["Feed", "Drugs and vaccines", "Brooding", "Transport", "Litter (sawdust)", "Labour", "Other"]} />
        <TextInput label="Note" optional multiline placeholder="Anything the others should know" />
      </div>
      <Checkbox label="Capital item (lasts more than one Set)" />
      <LinkedAmounts quantityLabel="Bags" quantityUnit="bags" unitLabel="Price per bag" defaultQuantity={10} defaultUnitPrice={24800} />
    </PreviewSection>
  );
}
