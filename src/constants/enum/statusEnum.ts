export const Status = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  SUSPENDED: "suspended",
  APPROVED: "approved",
  PENDING: "pending",
  REJECTED: "rejected"
} as const;

export type Status = typeof Status[keyof typeof Status];
