// A choice in a select or chip list: plain text or value + label
export type Option = string | { value: string; label: string };

export function toOption(option: Option): { value: string; label: string } {
  return typeof option === "string" ? { value: option, label: option } : option;
}
