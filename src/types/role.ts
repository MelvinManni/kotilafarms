// People's roles on the farm
export type Role = "owner" | "manager" | "recorder";

export const ROLE_LABEL: Record<Role, string> = {
  owner: "Owner",
  manager: "Manager",
  recorder: "Recorder",
};
