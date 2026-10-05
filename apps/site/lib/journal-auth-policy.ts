import "server-only";

export function isAllowedGitHubUserId(userId: string | number | null | undefined, configuredId = process.env.JOURNAL_ADMIN_GITHUB_USER_ID): boolean {
  return Boolean(configuredId && userId !== null && userId !== undefined && String(userId) === configuredId);
}
