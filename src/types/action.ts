// A simple action (label + link or click) that panels, notices and empty states can render as a button
import { isValidElement, type ReactNode } from "react";

export type ActionObject = { label: string; href?: string; onClick?: () => void };

export function isActionObject(action: unknown): action is ActionObject {
  return (
    typeof action === "object" &&
    action !== null &&
    !isValidElement(action) &&
    typeof (action as ActionObject).label === "string"
  );
}

export type ActionProp<T extends ActionObject = ActionObject> = ReactNode | T;
