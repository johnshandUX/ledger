import type { User } from "@johnshandux/ledger-synthetic-finance";

type AdminUserSummarySource = Readonly<{
  roleIds: readonly User["roleIds"][number][];
  status: User["status"];
}>;

export type AdminUserSummary = Readonly<{
  totalUsers: number;
  activeUsers: number;
  usersWithBankingRoles: number;
}>;

export function createAdminUserSummary(
  users: readonly AdminUserSummarySource[],
): AdminUserSummary {
  return users.reduce<AdminUserSummary>(
    (summary, user) => ({
      totalUsers: summary.totalUsers + 1,
      activeUsers: summary.activeUsers + (user.status === "active" ? 1 : 0),
      usersWithBankingRoles:
        summary.usersWithBankingRoles + (user.roleIds.length > 0 ? 1 : 0),
    }),
    { totalUsers: 0, activeUsers: 0, usersWithBankingRoles: 0 },
  );
}
