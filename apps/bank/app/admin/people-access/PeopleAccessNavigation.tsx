import Link from "next/link";

type PeopleAccessDestination = "users" | "roles";

const destinations = [
  { id: "users", label: "Users", href: "/admin/people-access" },
  { id: "roles", label: "Roles", href: "/admin/people-access/roles" },
] as const;

export function PeopleAccessNavigation({ active }: { active: PeopleAccessDestination }) {
  return (
    <nav className="people-access-navigation" aria-label="People and access">
      {destinations.map((destination) => (
        <Link
          key={destination.id}
          href={destination.href}
          aria-current={destination.id === active ? "page" : undefined}
        >
          {destination.label}
        </Link>
      ))}
    </nav>
  );
}
