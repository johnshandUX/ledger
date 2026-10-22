"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  Business,
  BusinessId,
} from "@johnshandux/ledger-synthetic-finance";
import { BANK_BUSINESS_ID } from "../src/finance/environment";
import {
  getBankOrganisationAccess,
  getBankOrganisationsForUser,
  type BankOrganisationAccess,
  type BankOrganisationMembership,
} from "../src/finance/organisations";
import { BANK_DEMO_USER_ID } from "../src/finance/users";

type BankOrganisationContextValue = Readonly<{
  activeOrganisationId: BusinessId;
  activeOrganisation: Business;
  activeMembership: BankOrganisationMembership;
  availableOrganisations: readonly BankOrganisationAccess[];
  switchActiveOrganisation: (organisationId: BusinessId) => void;
}>;

const BankOrganisationContext = createContext<
  BankOrganisationContextValue | undefined
>(undefined);

type BankOrganisationProviderProps = Readonly<{
  children: ReactNode;
  initialOrganisationId?: BusinessId;
}>;

export function BankOrganisationProvider({
  children,
  initialOrganisationId = BANK_BUSINESS_ID,
}: BankOrganisationProviderProps) {
  const availableOrganisations = useMemo(
    () => getBankOrganisationsForUser(BANK_DEMO_USER_ID),
    [],
  );
  const [activeOrganisationId, setActiveOrganisationId] = useState(
    initialOrganisationId,
  );
  const activeAccess = getBankOrganisationAccess(
    activeOrganisationId,
    BANK_DEMO_USER_ID,
  );

  if (!activeAccess) {
    throw new Error("The active Ledger Bank organisation is unavailable.");
  }

  const switchActiveOrganisation = useCallback(
    (organisationId: BusinessId) => {
      if (
        organisationId !== activeOrganisationId &&
        availableOrganisations.some(
          ({ business }) => business.id === organisationId,
        )
      ) {
        setActiveOrganisationId(organisationId);
      }
    },
    [activeOrganisationId, availableOrganisations],
  );

  const value = useMemo<BankOrganisationContextValue>(
    () => ({
      activeOrganisationId,
      activeOrganisation: activeAccess.business,
      activeMembership: activeAccess.membership,
      availableOrganisations,
      switchActiveOrganisation,
    }),
    [
      activeAccess,
      activeOrganisationId,
      availableOrganisations,
      switchActiveOrganisation,
    ],
  );

  return (
    <BankOrganisationContext value={value}>
      {children}
    </BankOrganisationContext>
  );
}

export function useBankOrganisation(): BankOrganisationContextValue {
  const context = useContext(BankOrganisationContext);
  if (!context) {
    throw new Error(
      "useBankOrganisation must be used within BankOrganisationProvider.",
    );
  }
  return context;
}
