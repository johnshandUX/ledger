"use client";

import { Fragment, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  Separator,
} from "@johnshandux/ledger-design-system";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@johnshandux/ledger-design-system/dropdown-menu";
import type { CurrencyCode } from "@johnshandux/ledger-synthetic-finance";
import { useEffectiveLiquidityPosition } from "./useBankEffectiveState";

const supportedCurrencies = ["GBP", "USD", "EUR"] as const satisfies readonly CurrencyCode[];
const currencySymbols = { GBP: "£", USD: "$", EUR: "€" } as const;
const pendingUnavailableDescription = "Pending movement data is unavailable.";

const balanceViews = [
  { id: "available", label: "Available balance", field: "availableBalanceMinor", supported: true },
  { id: "total", label: "Total balance", field: "ledgerBalanceMinor", supported: true },
  { id: "including-pending", label: "Including pending", supported: false },
  { id: "excluding-pending", label: "Excluding pending", supported: false },
] as const;

type SupportedBalanceView = Extract<(typeof balanceViews)[number], { supported: true }>;
type SupportedBalanceViewId = SupportedBalanceView["id"];

function formatSummaryAmount(amountMinor: number): string {
  if (!Number.isSafeInteger(amountMinor)) {
    throw new Error("Currency minor-unit amount must be a safe integer.");
  }

  return new Intl.NumberFormat("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amountMinor / 100);
}

export function FinancialSummary() {
  const [balanceViewId, setBalanceViewId] = useState<SupportedBalanceViewId>("available");
  const liquidity = useEffectiveLiquidityPosition();
  const balanceView = balanceViews.find(
    (view): view is SupportedBalanceView => view.supported && view.id === balanceViewId,
  )!;

  return (
    <section className="financial-summary" aria-labelledby="financial-summary-heading">
      <Card className="financial-summary-card">
        <CardBody className="financial-summary-card__body">
          <h2 className="visually-hidden" id="financial-summary-heading">Financial summary</h2>
          <div className="financial-summary-card__header">
            <p aria-live="polite" className="financial-summary-card__view-label">{balanceView.label}</p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  aria-label="Choose balance view"
                  className="financial-summary-card__menu-trigger"
                  size="small"
                  type="button"
                  variant="secondary"
                >
                  <span aria-hidden="true">•••</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="financial-summary-card__menu">
                <DropdownMenuRadioGroup
                  onValueChange={value => setBalanceViewId(value as SupportedBalanceViewId)}
                  value={balanceViewId}
                >
                  {balanceViews.map(view => (
                    <DropdownMenuRadioItem
                      aria-describedby={view.supported ? undefined : "pending-balance-view-description"}
                      disabled={!view.supported}
                      key={view.id}
                      value={view.id}
                    >
                      {view.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
                <p className="financial-summary-card__menu-description" id="pending-balance-view-description">
                  {pendingUnavailableDescription}
                </p>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="financial-summary-card__currencies">
            {supportedCurrencies.map((currency, index) => {
              const total = liquidity.byCurrency.find(item => item.currency === currency);
              const amountMinor = total?.[balanceView.field] ?? 0;
              const headingId = `financial-summary-${currency.toLowerCase()}`;

              return (
                <Fragment key={currency}>
                  {index > 0 ? <Separator className="financial-summary-card__mobile-separator" /> : null}
                  <section className="financial-summary-card__currency" aria-labelledby={headingId}>
                    <h3 className="financial-summary-card__identity" id={headingId}>
                      <span aria-hidden="true" className="financial-summary-card__symbol">{currencySymbols[currency]}</span>
                      <span>{currency}</span>
                    </h3>
                    <strong className="financial-summary-card__value financial-value">
                      {formatSummaryAmount(amountMinor)}
                    </strong>
                  </section>
                </Fragment>
              );
            })}
          </div>
        </CardBody>
      </Card>
    </section>
  );
}
