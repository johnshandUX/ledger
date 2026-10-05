import { redirect } from "next/navigation";
import { auth, isAllowedGitHubUserId, signIn } from "../../../auth";

export const metadata = { title: "Journal admin sign in" };

export default async function JournalAdminSignInPage() {
  const session = await auth();
  if (isAllowedGitHubUserId(session?.user?.githubId)) redirect("/journal/admin");
  return <main id="main-content" className="page-shell inner-page admin-sign-in"><p className="eyebrow">Journal admin</p><h1>Private publishing utility</h1><p>Sign in with the authorised GitHub account to manage Journal drafts and publish entries.</p><form action={async () => { "use server"; await signIn("github", { redirectTo: "/journal/admin" }); }}><button className="button-link" type="submit">Sign in with GitHub</button></form></main>;
}
