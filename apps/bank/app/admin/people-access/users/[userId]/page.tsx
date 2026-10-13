import { ProductShell } from "../../../../ProductShell";
import { UserDetailsExperience } from "./UserDetailsExperience";
import "../../people-access.css";

export default async function UserDetailPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;

  return (
    <ProductShell activeRoute="admin">
      <UserDetailsExperience userId={userId} />
    </ProductShell>
  );
}
