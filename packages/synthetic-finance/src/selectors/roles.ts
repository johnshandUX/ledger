import type { BusinessId, Role, RoleId } from "../domain/index.js";
import type { FinanceDataset } from "../validation/index.js";

export interface RoleQueryOptions {
  businessId?: BusinessId;
}

/** Returns matching banking roles in their stable dataset order. */
export function getRoles(
  dataset: FinanceDataset,
  options: RoleQueryOptions = {},
): Role[] {
  return dataset.roles.filter(
    (role) => options.businessId === undefined || role.businessId === options.businessId,
  );
}

export function getRoleById(
  dataset: FinanceDataset,
  roleId: RoleId,
): Role | undefined {
  return dataset.roles.find(({ id }) => id === roleId);
}
