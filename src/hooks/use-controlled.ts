// Value that is controlled when `value` is passed, internal otherwise
import { useState } from "react";

export function useControlled<T>(
  value: T | undefined,
  defaultValue: T,
  onChange?: (next: T) => void,
): [T, (next: T) => void] {
  const [internal, setInternal] = useState(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? value : internal;
  const set = (next: T) => {
    if (!isControlled) setInternal(next);
    onChange?.(next);
  };
  return [current, set];
}
