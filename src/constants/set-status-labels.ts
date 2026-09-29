// What each Set stage is called on screen
import type { SetStatus } from "@/types/set-status";

export const SET_STATUS_LABEL: Record<SetStatus, string> = {
  brooding: "Brooding",
  growing: "Growing",
  selling: "Selling",
  closed: "Closed",
};
