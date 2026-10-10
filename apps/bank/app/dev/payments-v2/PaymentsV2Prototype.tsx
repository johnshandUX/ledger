"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, AlertDescription, Button, Input, Select, Separator } from "@johnshandux/ledger-design-system";
import { Dialog, DialogBody, DialogClose, DialogContent, DialogFooter, DialogTrigger } from "@johnshandux/ledger-design-system/dialog";
import { Icon } from "@johnshandux/ledger-design-system/icons";
import { formatMinorCurrencyAmount } from "../../../src/presentation/money";
import { MultipleRecipientSelection } from "./MultipleRecipientSelection";
import { filterPrototypeOptions, getPrototypeBusinessDate, isPrototypeFutureDate, parsePrototypeGbpAmount } from "./prototype-model";
import type {
  PrototypeAccount,
  PrototypeRecipient,
  PrototypeRecipientGroup,
  PrototypeRecipientGroupMemberships,
} from "./prototype-model";

type PaymentMode = "single" | "multiple";
type PrototypeView = "entry" | "add-recipient" | "allocation-placeholder";
type ScheduleRepeat = "never" | "weekly" | "fortnightly" | "monthly" | "quarterly" | "annually";
type ScheduleEnd = "never" | "specific-date";
type PrototypeSchedule = Readonly<{
  date: string;
  repeats: ScheduleRepeat;
  ends: ScheduleEnd;
  endDate?: string;
}>;

export function PaymentsV2Prototype({
  accounts,
  recipients = [],
  recipientGroups = [],
  referenceDate,
}: Readonly<{
  accounts: readonly PrototypeAccount[];
  recipients?: readonly PrototypeRecipient[];
  recipientGroups?: readonly PrototypeRecipientGroup[];
  referenceDate?: string;
}>) {
  const [mode, setMode] = useState<PaymentMode>("single");
  const [view, setView] = useState<PrototypeView>("entry");
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [amountTouched, setAmountTouched] = useState(false);
  const [showRecipientPlaceholder, setShowRecipientPlaceholder] = useState(false);
  const [schedule, setSchedule] = useState<PrototypeSchedule>();
  const [selectedRecipientIds, setSelectedRecipientIds] = useState<readonly string[]>([]);
  const [temporaryRecipients, setTemporaryRecipients] = useState<readonly PrototypeRecipient[]>([]);
  const [recipientGroupMemberships, setRecipientGroupMemberships] = useState<PrototypeRecipientGroupMemberships>({});
  const [recipientSearch, setRecipientSearch] = useState("");
  const [recipientGroupFilter, setRecipientGroupFilter] = useState("all");
  const temporaryRecipientCounter = useRef(0);
  const subviewHeadingRef = useRef<HTMLHeadingElement>(null);
  const restoreFocusTarget = useRef<"add-recipient" | "continue-recipients" | undefined>(undefined);
  const account = accounts.find(({ id }) => id === accountId) ?? accounts[0];
  const effectiveReferenceDate = useMemo(
    () => referenceDate ?? getPrototypeBusinessDate(),
    [referenceDate],
  );
  const allRecipients = useMemo(
    () => [...recipients, ...temporaryRecipients],
    [recipients, temporaryRecipients],
  );
  const parsedAmount = parsePrototypeGbpAmount(amount);
  const amountExceedsBalance = Boolean(account && parsedAmount.valid && parsedAmount.amountMinor > account.availableBalanceMinor);
  const isScheduled = Boolean(schedule);
  const amountError = amountTouched
    ? !parsedAmount.valid
      ? "Enter a valid GBP amount with no more than two decimal places."
      : amountExceedsBalance && !isScheduled
        ? "The amount is higher than this account’s available balance."
        : undefined
    : undefined;
  const canContinue = parsedAmount.valid && (isScheduled || !amountExceedsBalance);
  const formattedAmount = canContinue ? formatMinorCurrencyAmount(parsedAmount.amountMinor, "GBP") : "—";

  function selectMode(nextMode: PaymentMode) {
    setMode(nextMode);
    setShowRecipientPlaceholder(false);
  }

  useEffect(() => {
    if (view !== "entry") {
      subviewHeadingRef.current?.focus();
    } else if (restoreFocusTarget.current) {
      document.getElementById(`payments-v2-${restoreFocusTarget.current}`)?.focus();
      restoreFocusTarget.current = undefined;
    }
  }, [view]);

  function returnToRecipientDirectory() {
    restoreFocusTarget.current = "add-recipient";
    setView("entry");
  }

  function returnFromAllocation() {
    restoreFocusTarget.current = "continue-recipients";
    setView("entry");
  }

  function addTemporaryRecipient(
    recipient: Omit<PrototypeRecipient, "id">,
    groupIds: readonly string[],
  ) {
    temporaryRecipientCounter.current += 1;
    const id = `recipient-prototype-${temporaryRecipientCounter.current}`;
    setTemporaryRecipients((current) => [...current, { ...recipient, id }]);
    setRecipientGroupMemberships((current) => ({ ...current, [id]: groupIds }));
    setSelectedRecipientIds((current) => current.includes(id) ? current : [...current, id]);
    returnToRecipientDirectory();
  }

  if (!account) {
    return <main className="page payments-v2-prototype-page"><Alert variant="error"><AlertDescription>No eligible GBP source accounts are available for this prototype.</AlertDescription></Alert></main>;
  }

  if (view !== "entry") {
    return (
      <main className="page payments-v2-prototype-page payments-v2-prototype-page--wide">
        <MultipleRecipientSelection
          view={view}
          headingRef={subviewHeadingRef}
          recipients={allRecipients}
          groups={recipientGroups}
          groupMemberships={recipientGroupMemberships}
          selectedRecipientIds={selectedRecipientIds}
          search={recipientSearch}
          groupFilter={recipientGroupFilter}
          onSearchChange={setRecipientSearch}
          onGroupFilterChange={setRecipientGroupFilter}
          onSelectedRecipientIdsChange={setSelectedRecipientIds}
          onAddRecipient={() => setView("add-recipient")}
          onSaveRecipient={addTemporaryRecipient}
          onCancelAddRecipient={returnToRecipientDirectory}
          onReturnToRecipients={returnFromAllocation}
          onContinue={() => setView("allocation-placeholder")}
        />
      </main>
    );
  }

  return (
    <main className="page payments-v2-prototype-page">
      <section className="payments-v2-entry" aria-labelledby="payments-v2-heading">
        <header className="payments-v2-entry-heading">
          <p>New payment</p>
          <h1 id="payments-v2-heading">Make a payment</h1>
        </header>
        <PaymentModeControl value={mode} onChange={selectMode} />
        <div className="payments-v2-field-group">
          <p className="payments-v2-section-label">From account</p>
          <AccountSelector
            accounts={accounts}
            selected={account}
            onSelect={(id) => {
              setAccountId(id);
              if (amount) setAmountTouched(true);
            }}
          />
        </div>
        {mode === "single" ? (
          <SinglePaymentSection
            value={amount}
            receivingAmount={formattedAmount}
            error={amountError}
            canContinue={canContinue}
            schedule={schedule}
            referenceDate={effectiveReferenceDate}
            onBlur={() => setAmountTouched(true)}
            onValueChange={(value) => {
              setAmount(value);
              setShowRecipientPlaceholder(false);
            }}
            onSchedule={(nextSchedule) => {
              setSchedule(nextSchedule);
              setShowRecipientPlaceholder(false);
            }}
            onUseImmediate={() => {
              setSchedule(undefined);
              if (amount) setAmountTouched(true);
              setShowRecipientPlaceholder(false);
            }}
            onContinue={() => setShowRecipientPlaceholder(true)}
          />
        ) : (
          <MultipleRecipientSelection
            recipients={allRecipients}
            groups={recipientGroups}
            groupMemberships={recipientGroupMemberships}
            selectedRecipientIds={selectedRecipientIds}
            search={recipientSearch}
            groupFilter={recipientGroupFilter}
            onSearchChange={setRecipientSearch}
            onGroupFilterChange={setRecipientGroupFilter}
            onSelectedRecipientIdsChange={setSelectedRecipientIds}
            onAddRecipient={() => setView("add-recipient")}
            onSaveRecipient={addTemporaryRecipient}
            onCancelAddRecipient={returnToRecipientDirectory}
            onReturnToRecipients={returnFromAllocation}
            onContinue={() => setView("allocation-placeholder")}
          />
        )}
        {showRecipientPlaceholder && (
          <Alert variant="informational" role="status">
            <AlertDescription>
              Prototype placeholder: Single recipient selection is not included in this review.
            </AlertDescription>
          </Alert>
        )}
      </section>
    </main>
  );
}

function PaymentModeControl({ value, onChange }: Readonly<{ value: PaymentMode; onChange: (value: PaymentMode) => void }>) {
  return (
    <fieldset className="payments-v2-mode-control">
      <legend className="visually-hidden">Payment mode</legend>
      {(["single", "multiple"] as const).map((mode) => (
        <label key={mode} className="payments-v2-mode-option">
          <input type="radio" name="payments-v2-mode" value={mode} checked={value === mode} onChange={() => onChange(mode)} />
          <span>{mode === "single" ? "Single" : "Multiple"}</span>
        </label>
      ))}
    </fieldset>
  );
}

function SinglePaymentSection({ value, receivingAmount, error, canContinue, schedule, referenceDate, onBlur, onValueChange, onSchedule, onUseImmediate, onContinue }: Readonly<{
  value: string;
  receivingAmount: string;
  error?: string;
  canContinue: boolean;
  schedule?: PrototypeSchedule;
  referenceDate: string;
  onBlur: () => void;
  onValueChange: (value: string) => void;
  onSchedule: (schedule: PrototypeSchedule) => void;
  onUseImmediate: () => void;
  onContinue: () => void;
}>) {
  const errorId = error ? "payments-v2-amount-error" : undefined;
  return (
    <div className="payments-v2-mode-content">
      <div className={`payments-v2-amount-surface${error ? " payments-v2-amount-surface--error" : ""}`}>
        <div className="payments-v2-amount-section">
          <label htmlFor="payments-v2-amount">You send</label>
          <div className="payments-v2-amount-row">
            <span className="payments-v2-currency" aria-hidden="true">GBP</span>
            <input
              id="payments-v2-amount"
              className="payments-v2-amount-input financial-value"
              inputMode="decimal"
              autoComplete="off"
              value={value}
              onBlur={onBlur}
              onChange={(event) => onValueChange(event.target.value)}
              aria-label="Amount you send in pounds sterling"
              aria-invalid={Boolean(error)}
              aria-describedby={errorId}
            />
          </div>
          {error && <p className="payments-v2-field-error" id={errorId} role="alert">{error}</p>}
        </div>
        <Separator />
        <div className="payments-v2-amount-section payments-v2-amount-section--output">
          <span>Recipient gets</span>
          <div className="payments-v2-amount-row">
            <span className="payments-v2-currency" aria-hidden="true">GBP</span>
            <output className="payments-v2-amount-output financial-value" htmlFor="payments-v2-amount" aria-label={`Recipient gets ${receivingAmount} in pounds sterling`}>
              {receivingAmount}
            </output>
          </div>
        </div>
      </div>
      <PaymentTiming
        schedule={schedule}
        referenceDate={referenceDate}
        onSchedule={onSchedule}
        onUseImmediate={onUseImmediate}
      />
      <div className="payments-v2-primary-action"><Button type="button" disabled={!canContinue} onClick={onContinue}>Continue to recipient</Button></div>
    </div>
  );
}

function PaymentTiming({ schedule, referenceDate, onSchedule, onUseImmediate }: Readonly<{
  schedule?: PrototypeSchedule;
  referenceDate: string;
  onSchedule: (schedule: PrototypeSchedule) => void;
  onUseImmediate: () => void;
}>) {
  const [open, setOpen] = useState(false);
  const [draftDate, setDraftDate] = useState("");
  const [draftRepeats, setDraftRepeats] = useState<ScheduleRepeat>("never");
  const [draftEnds, setDraftEnds] = useState<ScheduleEnd>("never");
  const [draftEndDate, setDraftEndDate] = useState("");
  const minimumDate = nextIsoDate(referenceDate);
  const validFutureDate = isFutureIsoDate(draftDate, referenceDate);
  const repeats = draftRepeats !== "never";
  const needsEndDate = repeats && draftEnds === "specific-date";
  const validEndDate = !needsEndDate || isIsoDateOnOrAfter(draftEndDate, draftDate);
  const endDateError = needsEndDate && draftEndDate && !validEndDate
    ? isValidIsoDate(draftDate)
      ? `Choose an end date on or after ${formatBritishDate(draftDate)}.`
      : "Choose a valid payment date first."
    : undefined;
  const canSetSchedule = validFutureDate && validEndDate;

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setDraftDate(schedule?.date ?? "");
      setDraftRepeats(schedule?.repeats ?? "never");
      setDraftEnds(schedule?.ends ?? "never");
      setDraftEndDate(schedule?.endDate ?? "");
    }
    setOpen(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <section className="payments-v2-timing-summary" aria-labelledby="payments-v2-timing-heading">
        <div>
          <h2 id="payments-v2-timing-heading">{schedule ? "Scheduled payment" : "Send as soon as possible"}</h2>
          <p>{schedule ? formatScheduleSummary(schedule) : "We'll submit this payment for processing immediately."}</p>
        </div>
        <DialogTrigger asChild>
          <Button id="payments-v2-schedule-trigger" type="button" variant="secondary" size="small">{schedule ? "Change" : "Schedule"}</Button>
        </DialogTrigger>
      </section>
      <DialogContent
        id="payments-v2-schedule-dialog"
        className="payments-v2-schedule-dialog"
        title="Schedule payment"
        description="Choose a future date for this domestic GBP payment."
        closeLabel="Close scheduling"
        tabIndex={-1}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          document.getElementById("payments-v2-schedule-dialog")?.focus();
        }}
      >
        <DialogBody className="payments-v2-schedule-body">
          <Input
            id="payments-v2-schedule-date"
            label="Payment date"
            type="date"
            min={minimumDate}
            value={draftDate}
            onChange={(event) => setDraftDate(event.target.value)}
            error={draftDate && !validFutureDate ? `Choose a date after ${formatBritishDate(referenceDate)}.` : undefined}
          />
          <Select
            id="payments-v2-schedule-repeats"
            label="Repeats"
            value={draftRepeats}
            options={repeatOptions}
            onChange={(event) => {
              const value = event.target.value as ScheduleRepeat;
              setDraftRepeats(value);
              if (value === "never") setDraftEnds("never");
            }}
          />
          {repeats && (
            <Select
              id="payments-v2-schedule-ends"
              label="Ends"
              value={draftEnds}
              options={endOptions}
              onChange={(event) => setDraftEnds(event.target.value as ScheduleEnd)}
            />
          )}
          {needsEndDate && (
            <Input
              id="payments-v2-schedule-end-date"
              label="End date"
              type="date"
              min={draftDate || minimumDate}
              value={draftEndDate}
              onChange={(event) => setDraftEndDate(event.target.value)}
              error={endDateError}
            />
          )}
          {schedule && (
            <Button type="button" variant="secondary" onClick={() => { onUseImmediate(); setOpen(false); }}>
              Send as soon as possible
            </Button>
          )}
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
          <Button
            type="button"
            disabled={!canSetSchedule}
            onClick={() => {
              onSchedule({
                date: draftDate,
                repeats: draftRepeats,
                ends: repeats ? draftEnds : "never",
                endDate: needsEndDate ? draftEndDate : undefined,
              });
              setOpen(false);
            }}
          >
            Set schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const repeatOptions = [
  { label: "Never", value: "never" },
  { label: "Weekly", value: "weekly" },
  { label: "Fortnightly", value: "fortnightly" },
  { label: "Monthly", value: "monthly" },
  { label: "Quarterly", value: "quarterly" },
  { label: "Annually", value: "annually" },
];

const endOptions = [
  { label: "Never", value: "never" },
  { label: "On a specific date", value: "specific-date" },
];

function isIsoDateOnOrAfter(value: string, earliest: string) {
  return isValidIsoDate(value) && isValidIsoDate(earliest) && value >= earliest;
}

function isValidIsoDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return date.getUTCFullYear() === Number(match[1])
    && date.getUTCMonth() + 1 === Number(match[2])
    && date.getUTCDate() === Number(match[3]);
}

function formatScheduleSummary(schedule: PrototypeSchedule) {
  const start = formatBritishDate(schedule.date);
  if (schedule.repeats === "never") return start;
  const frequency = repeatOptions.find(({ value }) => value === schedule.repeats)?.label ?? schedule.repeats;
  return schedule.ends === "specific-date" && schedule.endDate
    ? `${frequency} from ${start}, ending ${formatBritishDate(schedule.endDate)}`
    : `${frequency} from ${start}, no end date`;
}

function isFutureIsoDate(value: string, referenceDate: string) {
  return isPrototypeFutureDate(value, new Date(`${referenceDate}T12:00:00`));
}

function nextIsoDate(referenceDate: string) {
  const date = new Date(`${referenceDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

function formatBritishDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function AccountSelector({ accounts, selected, onSelect }: Readonly<{
  accounts: readonly PrototypeAccount[];
  selected: PrototypeAccount;
  onSelect: (id: string) => void;
}>) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => filterPrototypeOptions(accounts, query), [accounts, query]);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="payments-v2-account-trigger" type="button" aria-label={`Change account. Current account ${selected.name}, ${selected.maskedIdentifier}, available balance ${formatMinorCurrencyAmount(selected.availableBalanceMinor, "GBP")}`}>
          <span className="payments-v2-account-heading"><span className="payments-v2-account-name"><Icon name="card" /><strong>{selected.name}</strong></span><Icon name="chevron-right" /></span>
          <span className="identifier payments-v2-muted">{selected.maskedIdentifier}</span>
          <span className="payments-v2-account-divider" aria-hidden="true" />
          <span className="payments-v2-muted">Available balance</span>
          <strong className="payments-v2-account-balance financial-value">{formatMinorCurrencyAmount(selected.availableBalanceMinor, "GBP")}</strong>
          <span className="payments-v2-change-affordance">Change account</span>
        </button>
      </DialogTrigger>
      <DialogContent className="payments-v2-account-picker" title="Choose account" description="Select an eligible GBP account for this payment.">
        <DialogBody className="payments-v2-picker-body">
          <Input label="Search accounts" type="search" placeholder="Search by account name or number" value={query} onChange={(event) => setQuery(event.target.value)} />
          <ul className="payments-v2-option-list" aria-label="Eligible GBP accounts">
            {filtered.map((option) => (
              <li key={option.id}>
                <button className="payments-v2-option" type="button" aria-pressed={option.id === selected.id} onClick={() => { onSelect(option.id); setOpen(false); setQuery(""); }}>
                  <span><strong>{option.name}</strong><small>{option.maskedIdentifier}</small></span>
                  <span className="financial-value">{formatMinorCurrencyAmount(option.availableBalanceMinor, "GBP")}</span>
                </button>
              </li>
            ))}
            {filtered.length === 0 && <li className="payments-v2-empty-result">No accounts match your search.</li>}
          </ul>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
