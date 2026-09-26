"use client";
// Choose a buyer, or add a new one right here (name and phone)
import { Select } from "@/components/kotila/fields/select";
import { TextInput } from "@/components/kotila/fields/text-input";
import { NEW_BUYER } from "@/components/sales/sale-form-state";
import type { BuyerRow } from "@/types/sale";
import { shortDate } from "@/utils/format/dates";
import { naira } from "@/utils/format/naira";

type BuyerPickerProps = {
  buyers: BuyerRow[];
  value: string;
  onChange: (id: string) => void;
  newBuyer: { name: string; phone: string };
  onNewBuyer: (b: { name: string; phone: string }) => void;
  error?: string;
};

export function BuyerPicker({ buyers, value, onChange, newBuyer, onNewBuyer, error }: BuyerPickerProps) {
  const chosen = buyers.find((b) => b.id === value);
  const hint = chosen?.lastSale ? `Last bought ${shortDate(chosen.lastSale, false)}${chosen.balance > 0 ? ` · owes ${naira(chosen.balance)}` : ""}` : undefined;
  return (
    <>
      <Select
        label="Buyer"
        required
        placeholder="Choose the buyer"
        options={[...buyers.map((b) => ({ value: b.id, label: b.name })), { value: NEW_BUYER, label: "Add a new buyer" }]}
        value={value || undefined}
        onChange={onChange}
        hint={hint}
        error={error}
      />
      {value === NEW_BUYER ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <TextInput label="New buyer's name" required value={newBuyer.name} onChange={(name) => onNewBuyer({ ...newBuyer, name })} />
          <TextInput label="Phone" optional type="tel" value={newBuyer.phone} onChange={(phone) => onNewBuyer({ ...newBuyer, phone })} />
        </div>
      ) : null}
    </>
  );
}
