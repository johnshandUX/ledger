"use client";

import {
  OrganisationSwitcher,
  SideNav,
  SideNavGroup,
  SideNavHeader,
  SideNavItem,
  SideNavNavigation,
  SideNavUser,
  SideNavUtility,
  UserMenu,
  UserMenuItem,
} from "@johnshandux/ledger-design-system/application-navigation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useBankOrganisation } from "./BankOrganisationProvider";
import {
  bankNavigation,
  type BankNavigationRoute,
} from "./bank-navigation";
import { ThemeControl } from "./ThemeControl";

type BankNavigationProps = Readonly<{
  activeRoute: BankNavigationRoute;
  displayName: string;
}>;

export function BankNavigation({
  activeRoute,
  displayName,
}: BankNavigationProps) {
  const router = useRouter();
  const {
    activeOrganisationId,
    activeMembership,
    availableOrganisations,
    switchActiveOrganisation,
  } = useBankOrganisation();

  return (
    <SideNav>
      <SideNavHeader>
        <OrganisationSwitcher
          organisations={availableOrganisations.map(({ business }) => ({
            id: business.id,
            name: business.name,
          }))}
          selectedId={activeOrganisationId}
          showSelectedSecondaryLabel={false}
          onSelectedIdChange={(organisationId) => {
            switchActiveOrganisation(organisationId);
            router.push("/");
          }}
          addOrganisationAction={{ disabled: true }}
        />
      </SideNavHeader>
      <SideNavNavigation label="Primary">
        {bankNavigation.map((group) => (
          <SideNavGroup key={group.destinations[0].id} label={group.label}>
            {group.destinations.map((route) => (
              <SideNavItem key={route.id} asChild current={activeRoute === route.id}>
                <Link href={route.href}>{route.label}</Link>
              </SideNavItem>
            ))}
          </SideNavGroup>
        ))}
      </SideNavNavigation>
      <SideNavUtility>
        <div className="bank-navigation-appearance">
          <span>Appearance</span>
          <ThemeControl />
        </div>
      </SideNavUtility>
      <SideNavUser>
        <UserMenu
          displayName={displayName}
          secondaryText={activeMembership.role.name}
        >
          <UserMenuItem disabled>Personal preferences</UserMenuItem>
          <UserMenuItem disabled>Sign out</UserMenuItem>
        </UserMenu>
      </SideNavUser>
    </SideNav>
  );
}
