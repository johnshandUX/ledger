"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, AlertDescription, Button, Checkbox, Input } from "@johnshandux/ledger-design-system";
import { formatPrototypeSortCode, filterPrototypeRecipients } from "./prototype-model";
import type {
  PrototypeRecipient,
  PrototypeRecipientGroup,
  PrototypeRecipientGroupMemberships,
} from "./prototype-model";

type MultipleRecipientSelectionProps = Readonly<{
  view?: "add-recipient" | "allocation-placeholder";
  headingRef?: React.RefObject<HTMLHeadingElement | null>;
  recipients: readonly PrototypeRecipient[];
  groups: readonly PrototypeRecipientGroup[];
  groupMemberships: PrototypeRecipientGroupMemberships;
  selectedRecipientIds: readonly string[];
  search: string;
  groupFilter: string;
  onSearchChange: (value: string) => void;
  onGroupFilterChange: (value: string) => void;
  onSelectedRecipientIdsChange: (ids: readonly string[]) => void;
  onAddRecipient: () => void;
  onSaveRecipient: (recipient: Omit<PrototypeRecipient, "id">, groupIds: readonly string[]) => void;
  onCancelAddRecipient: () => void;
  onReturnToRecipients: () => void;
  onContinue: () => void;
}>;

export function MultipleRecipientSelection(props: MultipleRecipientSelectionProps) {
  if (props.view === "add-recipient") {
    return (
      <AddRecipientTask
        headingRef={props.headingRef}
        groups={props.groups}
        onSave={props.onSaveRecipient}
        onCancel={props.onCancelAddRecipient}
      />
    );
  }

  if (props.view === "allocation-placeholder") {
    return (
      <section className="payments-v2-recipient-journey" aria-labelledby="payments-v2-allocation-heading">
        <JourneyHeading
          context="Multiple payment"
          id="payments-v2-allocation-heading"
          headingRef={props.headingRef}
          title="Allocate payment amounts"
        />
        <Alert variant="informational">
          <AlertDescription>
            Prototype placeholder: individual amount allocation for {props.selectedRecipientIds.length} {props.selectedRecipientIds.length === 1 ? "recipient" : "recipients"} is not included in this review.
          </AlertDescription>
        </Alert>
        <div className="payments-v2-recipient-actions">
          <Button type="button" onClick={props.onReturnToRecipients}>Back to recipients</Button>
        </div>
      </section>
    );
  }

  return <RecipientDirectory {...props} />;
}

function RecipientDirectory({
  recipients,
  groups,
  groupMemberships,
  selectedRecipientIds,
  search,
  groupFilter,
  onSearchChange,
  onGroupFilterChange,
  onSelectedRecipientIdsChange,
  onAddRecipient,
  onContinue,
}: MultipleRecipientSelectionProps) {
  const selected = useMemo(() => new Set(selectedRecipientIds), [selectedRecipientIds]);
  const filteredByGroup = groupFilter === "all"
    ? recipients
    : recipients.filter((recipient) => recipientBelongsToGroup(recipient.id, groupFilter, groups, groupMemberships));
  const visibleRecipients = filterPrototypeRecipients(filteredByGroup, search);
  const selectedRecipients = selectedRecipientIds
    .map((id) => recipients.find((recipient) => recipient.id === id))
    .filter((recipient): recipient is PrototypeRecipient => Boolean(recipient));
  const visibleSelectedCount = visibleRecipients.filter(({ id }) => selected.has(id)).length;
  const allVisibleSelected = visibleRecipients.length > 0 && visibleSelectedCount === visibleRecipients.length;
  const someVisibleSelected = visibleSelectedCount > 0 && !allVisibleSelected;

  function toggleRecipient(id: string, checked: boolean) {
    onSelectedRecipientIdsChange(
      checked
        ? selected.has(id) ? selectedRecipientIds : [...selectedRecipientIds, id]
        : selectedRecipientIds.filter((recipientId) => recipientId !== id),
    );
  }

  function toggleAllShown(checked: boolean) {
    const shownIds = new Set(visibleRecipients.map(({ id }) => id));
    onSelectedRecipientIdsChange(
      checked
        ? [...new Set([...selectedRecipientIds, ...shownIds])]
        : selectedRecipientIds.filter((id) => !shownIds.has(id)),
    );
  }

  return (
    <section className="payments-v2-recipient-journey payments-v2-recipient-journey--inline" aria-labelledby="payments-v2-recipient-heading">
      <div className="payments-v2-recipient-section-heading">
        <h2 id="payments-v2-recipient-heading">Recipients</h2>
        <Button id="payments-v2-add-recipient" type="button" variant="secondary" onClick={onAddRecipient}>Add recipient</Button>
      </div>

      <div className="payments-v2-recipient-search">
        <Input
          id="payments-v2-recipient-search"
          label="Search recipients"
          type="search"
          placeholder="Search by recipient or account number"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <nav className="payments-v2-group-filters" aria-label="Filter recipients by group">
        <button type="button" aria-pressed={groupFilter === "all"} onClick={() => onGroupFilterChange("all")}>All recipients</button>
        {groups.map((group) => (
          <button key={group.id} type="button" aria-pressed={groupFilter === group.id} onClick={() => onGroupFilterChange(group.id)}>{group.name}</button>
        ))}
      </nav>

      <RecipientTable
        recipients={visibleRecipients}
        selected={selected}
        allVisibleSelected={allVisibleSelected}
        someVisibleSelected={someVisibleSelected}
        onToggleRecipient={toggleRecipient}
        onToggleAllShown={toggleAllShown}
      />

      <SelectedRecipientSummary
        recipients={selectedRecipients}
        onRemove={(id) => toggleRecipient(id, false)}
        onClear={() => onSelectedRecipientIdsChange([])}
      />

      <div className="payments-v2-recipient-actions">
        <Button id="payments-v2-continue-recipients" type="button" disabled={selectedRecipientIds.length === 0} onClick={onContinue}>
          Continue with {selectedRecipientIds.length} {selectedRecipientIds.length === 1 ? "recipient" : "recipients"}
        </Button>
      </div>
    </section>
  );
}

function RecipientTable({
  recipients,
  selected,
  allVisibleSelected,
  someVisibleSelected,
  onToggleRecipient,
  onToggleAllShown,
}: Readonly<{
  recipients: readonly PrototypeRecipient[];
  selected: ReadonlySet<string>;
  allVisibleSelected: boolean;
  someVisibleSelected: boolean;
  onToggleRecipient: (id: string, checked: boolean) => void;
  onToggleAllShown: (checked: boolean) => void;
}>) {
  const selectAllRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = someVisibleSelected;
  }, [someVisibleSelected]);

  if (recipients.length === 0) {
    return <p className="payments-v2-recipient-empty" role="status">No recipients match your search and group filter.</p>;
  }

  return (
    <div className="payments-v2-recipient-table-wrap">
      <table className="payments-v2-recipient-table">
        <caption className="visually-hidden">Recipient accounts</caption>
        <thead>
          <tr>
            <th scope="col" className="payments-v2-selection-cell">
              <label className="payments-v2-native-checkbox">
                <input
                  ref={selectAllRef}
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={(event) => onToggleAllShown(event.target.checked)}
                  aria-label="Select all"
                />
                <span aria-hidden="true" />
              </label>
            </th>
            <th scope="col">Recipient</th>
            <th scope="col">Bank account</th>
          </tr>
        </thead>
        <tbody>
          {recipients.map((recipient) => (
            <tr key={recipient.id} data-selected={selected.has(recipient.id) ? "true" : undefined}>
              <td className="payments-v2-selection-cell">
                <Checkbox
                  id={`payments-v2-recipient-${recipient.id}`}
                  className="payments-v2-row-checkbox"
                  label={`Select ${recipient.name}, account ${recipient.maskedIdentifier}`}
                  checked={selected.has(recipient.id)}
                  onChange={(event) => onToggleRecipient(recipient.id, event.target.checked)}
                />
              </td>
              <th scope="row">{recipient.name}</th>
              <td><span className="identifier">{recipient.maskedIdentifier}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SelectedRecipientSummary({
  recipients,
  onRemove,
  onClear,
}: Readonly<{
  recipients: readonly PrototypeRecipient[];
  onRemove: (id: string) => void;
  onClear: () => void;
}>) {
  return (
    <section className="payments-v2-selected-summary" aria-live="polite" aria-labelledby="payments-v2-selected-heading">
      <div className="payments-v2-selected-summary-heading">
        <div>
          <span id="payments-v2-selected-heading">Selected recipients</span>
          <strong>{recipients.length} selected</strong>
        </div>
        {recipients.length > 0 && <Button type="button" variant="secondary" size="small" onClick={onClear}>Clear selection</Button>}
      </div>
      {recipients.length === 0 ? (
        <p>Select at least one recipient to continue.</p>
      ) : (
        <details>
          <summary>Review selected recipients</summary>
          <ul>
            {recipients.map((recipient) => (
              <li key={recipient.id}>
                <span><strong>{recipient.name}</strong><small>{recipient.maskedIdentifier}</small></span>
                <Button type="button" variant="secondary" size="small" aria-label={`Remove ${recipient.name}, account ${recipient.maskedIdentifier}`} onClick={() => onRemove(recipient.id)}>Remove</Button>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}

function AddRecipientTask({
  headingRef,
  groups,
  onSave,
  onCancel,
}: Readonly<{
  headingRef?: React.RefObject<HTMLHeadingElement | null>;
  groups: readonly PrototypeRecipientGroup[];
  onSave: (recipient: Omit<PrototypeRecipient, "id">, groupIds: readonly string[]) => void;
  onCancel: () => void;
}>) {
  const [name, setName] = useState("");
  const [sortCode, setSortCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [groupSearch, setGroupSearch] = useState("");
  const [groupIds, setGroupIds] = useState<readonly string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const nameError = submitted && !name.trim() ? "Enter the recipient name." : undefined;
  const sortCodeDigits = sortCode.replace(/\D/g, "");
  const sortCodeError = submitted && sortCodeDigits.length !== 6 ? "Enter a six-digit UK sort code." : undefined;
  const accountNumberDigits = accountNumber.replace(/\D/g, "");
  const accountNumberError = submitted && accountNumberDigits.length !== 8 ? "Enter an eight-digit UK account number." : undefined;
  const filteredGroups = groups.filter((group) => group.name.toLocaleLowerCase("en-GB").includes(groupSearch.trim().toLocaleLowerCase("en-GB")));

  function submit() {
    setSubmitted(true);
    if (!name.trim() || sortCodeDigits.length !== 6 || accountNumberDigits.length !== 8) return;
    onSave({
      name: name.trim(),
      accountName: name.trim(),
      accountNumber: accountNumberDigits,
      sortCode: formatPrototypeSortCode(sortCodeDigits),
      maskedIdentifier: `•••• ${accountNumberDigits.slice(-4)}`,
      currency: "GBP",
    }, groupIds);
  }

  return (
    <form
      className="payments-v2-recipient-journey payments-v2-add-recipient"
      aria-labelledby="payments-v2-add-recipient-heading"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <JourneyHeading context="Multiple payment" id="payments-v2-add-recipient-heading" headingRef={headingRef} title="Add recipient" />
      <p className="payments-v2-subview-lead">Add a domestic GBP recipient account. This prototype does not perform Confirmation of Payee or account ownership checks.</p>
      <div className="payments-v2-add-recipient-fields">
        <Input id="payments-v2-new-recipient-name" label="Recipient name" value={name} onChange={(event) => setName(event.target.value)} error={nameError} />
        <Input id="payments-v2-new-recipient-sort-code" label="UK sort code" inputMode="numeric" placeholder="12-34-56" value={sortCode} onChange={(event) => setSortCode(formatPrototypeSortCode(event.target.value))} error={sortCodeError} />
        <Input id="payments-v2-new-recipient-account-number" label="UK account number" inputMode="numeric" placeholder="12345678" value={accountNumber} onChange={(event) => setAccountNumber(event.target.value.replace(/\D/g, "").slice(0, 8))} error={accountNumberError} />
      </div>
      <fieldset className="payments-v2-group-assignment">
        <legend>Groups <span>Optional</span></legend>
        <Input id="payments-v2-group-search" label="Search groups" type="search" value={groupSearch} onChange={(event) => setGroupSearch(event.target.value)} />
        {groupIds.length > 0 && (
          <ul className="payments-v2-selected-groups" aria-label="Selected groups">
            {groupIds.map((id) => {
              const group = groups.find((candidate) => candidate.id === id);
              return group ? <li key={id}><span>{group.name}</span><button type="button" aria-label={`Remove ${group.name} group`} onClick={() => setGroupIds((current) => current.filter((groupId) => groupId !== id))}>Remove</button></li> : null;
            })}
          </ul>
        )}
        <div className="payments-v2-group-options">
          {filteredGroups.map((group) => (
            <Checkbox
              key={group.id}
              id={`payments-v2-new-recipient-${group.id}`}
              label={group.name}
              checked={groupIds.includes(group.id)}
              onChange={(event) => setGroupIds((current) => event.target.checked ? [...current, group.id] : current.filter((id) => id !== group.id))}
            />
          ))}
          {filteredGroups.length === 0 && <p>No groups match your search.</p>}
        </div>
      </fieldset>
      <div className="payments-v2-recipient-actions">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Add recipient</Button>
      </div>
    </form>
  );
}

function JourneyHeading({
  context,
  id,
  headingRef,
  title,
}: Readonly<{
  context: string;
  id: string;
  headingRef?: React.RefObject<HTMLHeadingElement | null>;
  title: string;
}>) {
  return (
    <header className="payments-v2-entry-heading">
      <p>{context}</p>
      <h1 id={id} ref={headingRef} tabIndex={-1}>{title}</h1>
    </header>
  );
}

function recipientBelongsToGroup(
  recipientId: string,
  groupId: string,
  groups: readonly PrototypeRecipientGroup[],
  memberships: PrototypeRecipientGroupMemberships,
) {
  const group = groups.find(({ id }) => id === groupId);
  return Boolean(group?.recipientIds.includes(recipientId) || memberships[recipientId]?.includes(groupId));
}
