import "server-only";

import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { isAllowedGitHubUserId } from "./lib/journal-auth-policy";

export { isAllowedGitHubUserId } from "./lib/journal-auth-policy";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub({ authorization: { params: { scope: "read:user" } } })],
  session: { strategy: "jwt" },
  callbacks: {
    signIn({ profile }) { return isAllowedGitHubUserId(profile?.id); },
    jwt({ token, profile }) { if (profile?.id !== undefined) token.githubId = String(profile.id); return token; },
    session({ session, token }) { if (session.user) session.user.githubId = typeof token.githubId === "string" ? token.githubId : undefined; return session; },
  },
});
