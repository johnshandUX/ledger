import { redirect } from "next/navigation";
import { auth, isAllowedGitHubUserId } from "../auth";

export async function requireJournalAdmin() {
  const session = await auth();
  if (!isAllowedGitHubUserId(session?.user?.githubId)) redirect("/journal/admin-sign-in");
  return session;
}

export async function assertJournalAdmin() {
  const session = await auth();
  if (!isAllowedGitHubUserId(session?.user?.githubId)) throw new Error("Unauthorized");
  return session;
}
