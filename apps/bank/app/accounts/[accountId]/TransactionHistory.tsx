"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, Input, Select } from "@johnshandux/ledger-design-system";
import { DataTable, type DataTableColumn, type DataTableState } from "@johnshandux/ledger-design-system/data-table";
import { Icon } from "@johnshandux/ledger-design-system/icons";
import { Popover, PopoverContent, PopoverTrigger } from "@johnshandux/ledger-design-system/popover";
import { Sheet, SheetBody, SheetContent, SheetFooter, SheetTrigger } from "@johnshandux/ledger-design-system/sheet";
import type { BankTransaction } from "../../../src/finance/transactions";
import { formatPostedDate, getTransactionAmounts } from "../../../src/presentation/accountDetail";
import { formatMinorCurrencyAmount } from "../../../src/presentation/money";
import { collectTransactions, DEFAULT_TRANSACTION_CRITERIA, getDateRangeError, parsePositiveInteger, parseTransactionCriteria, TRANSACTION_PAGE_SIZE, type TransactionCollectionCriteria, type TransactionDirectionFilter, type TransactionSort } from "../../../src/presentation/transactionHistory";

type InitialSearchParams = Record<string, string | string[] | undefined>;
type TransactionHistoryProps = { transactions: BankTransaction[]; initialSearchParams?: InitialSearchParams };

function TransactionContext({ transaction }: { transaction: BankTransaction }) {
  return <><span className="transaction-description">{transaction.counterpartyName ?? transaction.description}</span>{transaction.counterpartyName && <span className="transaction-secondary">{transaction.description}</span>}{transaction.reference && <span className="transaction-reference">Reference: {transaction.reference}</span>}</>;
}

export const transactionColumns: readonly DataTableColumn<BankTransaction>[] = [
  { id: "date", label: "Date", header: "Date", nowrap: true, cell: ({ row }) => <span className="transaction-date">{formatPostedDate(row.bookedAt)}</span> },
  { id: "transaction", label: "Transaction", header: "Transaction", cell: ({ row }) => <div className="transaction-copy"><TransactionContext transaction={row} /></div> },
  { id: "status", label: "Status", header: "Status", cell: () => <span className="transaction-status">Booked</span> },
  { id: "moneyOut", label: "Money out", header: "Money out", align: "right", headerAlign: "right", numeric: true, nowrap: true, cell: ({ row }) => { const { moneyOutMinor } = getTransactionAmounts(row); return moneyOutMinor === undefined ? "—" : formatMinorCurrencyAmount(moneyOutMinor, row.currency); } },
  { id: "moneyIn", label: "Money in", header: "Money in", align: "right", headerAlign: "right", numeric: true, nowrap: true, cell: ({ row }) => { const { moneyInMinor } = getTransactionAmounts(row); return moneyInMinor === undefined ? "—" : formatMinorCurrencyAmount(moneyInMinor, row.currency); } },
];

const sortOptions = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "amount-high", label: "Amount: highest first" },
  { value: "amount-low", label: "Amount: lowest first" },
];

function initialUrlSearchParams(initial: InitialSearchParams = {}) {
  const params = new URLSearchParams();
  for (const [key, rawValue] of Object.entries(initial)) {
    for (const value of Array.isArray(rawValue) ? rawValue : rawValue === undefined ? [] : [rawValue]) params.append(key, value);
  }
  return params;
}

function setOptionalParam(params: URLSearchParams, name: string, value: string, defaultValue = "") {
  if (value === defaultValue) params.delete(name); else params.set(name, value);
}

function DirectionControl({ value, onChange }: { value: TransactionDirectionFilter; onChange: (value: TransactionDirectionFilter) => void }) {
  const choices: readonly { value: Exclude<TransactionDirectionFilter, "all">; label: string; accessibleLabel: string }[] = [
    { value: "credit", label: "In", accessibleLabel: "money in" },
    { value: "debit", label: "Out", accessibleLabel: "money out" },
  ];
  return <div className="transaction-direction" role="group" aria-label="Transaction direction">{choices.map(choice => {
    const active = value === choice.value;
    return <Button key={choice.value} type="button" variant="secondary" size="small" className="transaction-direction-button" aria-pressed={active} aria-label={active ? `Clear ${choice.accessibleLabel} filter` : `Filter by ${choice.accessibleLabel}`} onClick={() => onChange(active ? "all" : choice.value)}><span>{choice.label}</span><span className="transaction-direction-icon" aria-hidden="true"><Icon name="close" size="small" /></span></Button>;
  })}</div>;
}

type DateDraft = { from: string; to: string };
function DateFields({ draft, error, prefix, onChange }: { draft: DateDraft; error?: string; prefix: string; onChange: (draft: DateDraft) => void }) {
  const fromError = error === "Enter a valid start date." ? error : undefined;
  const toError = error && !fromError ? error : undefined;
  return <div className="transaction-date-fields"><Input id={`${prefix}-from`} label="From date" type="date" value={draft.from} error={fromError} onChange={event => onChange({ ...draft, from: event.currentTarget.value })} /><Input id={`${prefix}-to`} label="To date" type="date" value={draft.to} error={toError} onChange={event => onChange({ ...draft, to: event.currentTarget.value })} /></div>;
}

export function TransactionHistory({ transactions, initialSearchParams = {} }: TransactionHistoryProps) {
  const initialParams = useMemo(() => initialUrlSearchParams(initialSearchParams), [initialSearchParams]);
  const initialHasPage = initialParams.has("txPage");
  const initialHasCount = initialParams.has("txCount");
  const [criteria, setCriteria] = useState<TransactionCollectionCriteria>(() => parseTransactionCriteria(initialParams));
  const [queryInput, setQueryInput] = useState(criteria.query);
  const [page, setPage] = useState(() => parsePositiveInteger(initialParams.get("txPage"), 1));
  const [mobileCount, setMobileCount] = useState(() => parsePositiveInteger(initialParams.get("txCount"), TRANSACTION_PAGE_SIZE));
  const [isMobile, setIsMobile] = useState(false);
  const [desktopDateOpen, setDesktopDateOpen] = useState(false);
  const [mobileDateOpen, setMobileDateOpen] = useState(false);
  const [dateDraft, setDateDraft] = useState<DateDraft>({ from: criteria.from, to: criteria.to });
  const [dateError, setDateError] = useState<string>();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const criteriaRef = useRef(criteria);
  const pageRef = useRef(page);
  const mobileCountRef = useRef(mobileCount);
  const isMobileRef = useRef(false);
  const firstViewportSyncRef = useRef(true);
  useEffect(() => { criteriaRef.current = criteria; }, [criteria]);
  useEffect(() => { pageRef.current = page; }, [page]);
  useEffect(() => { mobileCountRef.current = mobileCount; }, [mobileCount]);

  const writeUrl = useCallback((nextCriteria: TransactionCollectionCriteria, options: { history: "push" | "replace"; page?: number; count?: number }) => {
    const params = new URLSearchParams(window.location.search);
    setOptionalParam(params, "txQuery", nextCriteria.query.trim());
    setOptionalParam(params, "txFrom", nextCriteria.from);
    setOptionalParam(params, "txTo", nextCriteria.to);
    setOptionalParam(params, "txDirection", nextCriteria.direction, "all");
    setOptionalParam(params, "txSort", nextCriteria.sort, "newest");
    if (options.page !== undefined) { params.delete("txCount"); setOptionalParam(params, "txPage", String(options.page), "1"); }
    if (options.count !== undefined) { params.delete("txPage"); setOptionalParam(params, "txCount", String(options.count), String(TRANSACTION_PAGE_SIZE)); }
    const query = params.toString();
    window.history[options.history === "push" ? "pushState" : "replaceState"](null, "", `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`);
  }, []);

  const resetPosition = useCallback((nextCriteria: TransactionCollectionCriteria, history: "push" | "replace") => {
    setPage(1); setMobileCount(TRANSACTION_PAGE_SIZE);
    pageRef.current = 1; mobileCountRef.current = TRANSACTION_PAGE_SIZE;
    writeUrl(nextCriteria, isMobile ? { history, count: TRANSACTION_PAGE_SIZE } : { history, page: 1 });
  }, [isMobile, writeUrl]);
  const commitCriteria = useCallback((nextCriteria: TransactionCollectionCriteria, history: "push" | "replace") => {
    setCriteria(nextCriteria); resetPosition(nextCriteria, history);
  }, [resetPosition]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 1100px)");
    const syncViewport = () => {
      const mobile = media.matches; setIsMobile(mobile); isMobileRef.current = mobile;
      const firstSync = firstViewportSyncRef.current;
      if (mobile) { const requestedCount = firstSync && initialHasCount ? mobileCountRef.current : pageRef.current * TRANSACTION_PAGE_SIZE; const resultCount = collectTransactions(transactions, criteriaRef.current).length; const nextCount = Math.max(TRANSACTION_PAGE_SIZE, Math.min(requestedCount, resultCount)); setMobileCount(nextCount); mobileCountRef.current = nextCount; writeUrl(criteriaRef.current, { history: "replace", count: nextCount }); }
      else { const nextPage = firstSync && initialHasPage ? pageRef.current : Math.max(1, Math.ceil(mobileCountRef.current / TRANSACTION_PAGE_SIZE)); setPage(nextPage); pageRef.current = nextPage; writeUrl(criteriaRef.current, { history: "replace", page: nextPage }); }
      firstViewportSyncRef.current = false;
    };
    syncViewport(); media.addEventListener("change", syncViewport);
    return () => media.removeEventListener("change", syncViewport);
  // View transitions intentionally translate the last visible collection position.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const restore = () => {
      const params = new URLSearchParams(window.location.search); const nextCriteria = parseTransactionCriteria(params);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      criteriaRef.current = nextCriteria;
      setCriteria(nextCriteria); setQueryInput(nextCriteria.query);
      const requestedPage = parsePositiveInteger(params.get("txPage"), 1); const requestedCount = parsePositiveInteger(params.get("txCount"), TRANSACTION_PAGE_SIZE);
      const resultCount = collectTransactions(transactions, nextCriteria).length;
      if (isMobileRef.current) {
        const sourceCount = params.has("txCount") ? requestedCount : requestedPage * TRANSACTION_PAGE_SIZE;
        const nextCount = Math.max(TRANSACTION_PAGE_SIZE, Math.min(sourceCount, resultCount));
        setMobileCount(nextCount); mobileCountRef.current = nextCount;
        writeUrl(nextCriteria, { history: "replace", count: nextCount });
      } else {
        const sourcePage = params.has("txPage") ? requestedPage : Math.ceil(requestedCount / TRANSACTION_PAGE_SIZE);
        const nextPage = Math.max(1, Math.min(sourcePage, Math.ceil(resultCount / TRANSACTION_PAGE_SIZE) || 1));
        setPage(nextPage); pageRef.current = nextPage;
        writeUrl(nextCriteria, { history: "replace", page: nextPage });
      }
    };
    window.addEventListener("popstate", restore); return () => window.removeEventListener("popstate", restore);
  }, [transactions, writeUrl]);
  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  const matchingTransactions = useMemo(() => collectTransactions(transactions, criteria), [transactions, criteria]);
  const pageCount = Math.max(1, Math.ceil(matchingTransactions.length / TRANSACTION_PAGE_SIZE));
  const effectivePage = Math.min(page, pageCount);
  const effectiveMobileCount = Math.min(mobileCount, matchingTransactions.length);
  useEffect(() => {
    if (page === effectivePage || isMobile) return;
    pageRef.current = effectivePage;
    writeUrl(criteria, { history: "replace", page: effectivePage });
    const timeout = window.setTimeout(() => setPage(effectivePage), 0);
    return () => window.clearTimeout(timeout);
  }, [criteria, effectivePage, isMobile, page, writeUrl]);

  const updateQuery = (query: string, immediate = false) => {
    setQueryInput(query); if (debounceRef.current) clearTimeout(debounceRef.current);
    const apply = () => commitCriteria({ ...criteriaRef.current, query: query.trim() }, "replace");
    if (immediate) apply(); else debounceRef.current = setTimeout(apply, 250);
  };
  const applyDates = () => {
    const error = getDateRangeError(dateDraft.from, dateDraft.to); setDateError(error); if (error) return;
    commitCriteria({ ...criteria, ...dateDraft }, "push"); setDesktopDateOpen(false); setMobileDateOpen(false);
  };
  const clearDates = () => {
    const empty = { from: "", to: "" }; setDateDraft(empty); setDateError(undefined);
    commitCriteria({ ...criteria, ...empty }, "push"); setDesktopDateOpen(false); setMobileDateOpen(false);
  };
  const clearDateDraft = () => { setDateDraft({ from: "", to: "" }); setDateError(undefined); };
  const resetFilters = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setQueryInput(""); setDateDraft({ from: "", to: "" }); setDateError(undefined);
    commitCriteria({ ...DEFAULT_TRANSACTION_CRITERIA, sort: criteria.sort }, "push");
  };

  if (transactions.length === 0) return <div className="empty-state"><h3>No transactions to show yet.</h3><p>Transactions will appear here when activity is recorded on this account.</p></div>;
  const tableState: DataTableState = { query: "", filters: {}, pageIndex: effectivePage - 1, pageSize: TRANSACTION_PAGE_SIZE };
  const activeDateCount = Number(Boolean(criteria.from)) + Number(Boolean(criteria.to));

  return <>
    <div className="transaction-toolbar">
      <form className="transaction-search" role="search" onSubmit={event => { event.preventDefault(); updateQuery(queryInput, true); }}><Input label="Search transactions" type="search" placeholder="Description, counterparty or reference" value={queryInput} onChange={event => updateQuery(event.currentTarget.value)} /></form>
      <div className="transaction-date-filter transaction-date-filter--desktop"><Popover open={desktopDateOpen} onOpenChange={open => { setDesktopDateOpen(open); if (open) { setDateDraft({ from: criteria.from, to: criteria.to }); setDateError(undefined); } }}><PopoverTrigger asChild><Button type="button" variant="secondary">Dates{activeDateCount ? ` (${activeDateCount})` : ""}</Button></PopoverTrigger><PopoverContent accessibleLabel="Filter transactions by booked date" align="start" className="transaction-date-popover"><DateFields prefix="desktop-transaction-date" draft={dateDraft} error={dateError} onChange={setDateDraft} /><div className="transaction-date-actions"><Button type="button" variant="secondary" onClick={clearDates}>Clear</Button><Button type="button" onClick={applyDates}>Apply</Button></div></PopoverContent></Popover></div>
      <DirectionControl value={criteria.direction} onChange={direction => commitCriteria({ ...criteria, direction }, "push")} />
      <div className="transaction-date-filter transaction-date-filter--mobile"><Sheet open={mobileDateOpen} onOpenChange={open => { setMobileDateOpen(open); if (open) { setDateDraft({ from: criteria.from, to: criteria.to }); setDateError(undefined); } }}><SheetTrigger asChild><Button type="button" variant="secondary">Filters{activeDateCount ? ` (${activeDateCount})` : ""}</Button></SheetTrigger><SheetContent title="Filter transactions" description="Filter using the booked transaction date."><SheetBody><DateFields prefix="mobile-transaction-date" draft={dateDraft} error={dateError} onChange={setDateDraft} /></SheetBody><SheetFooter><Button type="button" variant="secondary" onClick={clearDateDraft}>Clear filters</Button><Button type="button" onClick={applyDates}>Show transactions</Button></SheetFooter></SheetContent></Sheet></div>
    </div>
    <div className="transaction-collection-heading"><p role="status" aria-live="polite">{matchingTransactions.length} matching transaction{matchingTransactions.length === 1 ? "" : "s"}</p><Select label="Sort transactions" value={criteria.sort} options={sortOptions} onChange={event => commitCriteria({ ...criteria, sort: event.currentTarget.value as TransactionSort }, "push")} /></div>
    {activeDateCount > 0 && <p className="transaction-active-filter">Booked date: {criteria.from || "Any date"} to {criteria.to || "Any date"}</p>}
    {matchingTransactions.length === 0 ? <div className="empty-state transaction-no-results"><h3>No transactions match your search or filters.</h3><Button type="button" variant="secondary" onClick={resetFilters}>Reset filters</Button></div> : <>
      <div className="transactions-desktop"><DataTable caption="Transactions for this account" rows={matchingTransactions} columns={transactionColumns} getRowId={transaction => transaction.id} pageSizeOptions={[TRANSACTION_PAGE_SIZE]} itemLabel={{ singular: "transaction", plural: "transactions" }} state={tableState} onStateChange={(nextState, metadata) => { if (metadata.reason !== "page") return; const nextPage = nextState.pageIndex + 1; setPage(nextPage); pageRef.current = nextPage; writeUrl(criteria, { history: "push", page: nextPage }); }} /></div>
      <div className="transactions-mobile"><ol aria-label="Transactions for this account">{matchingTransactions.slice(0, effectiveMobileCount).map(transaction => { const { moneyInMinor, moneyOutMinor } = getTransactionAmounts(transaction); const amountMinor = moneyInMinor ?? moneyOutMinor ?? 0; return <li className="transaction-card" key={transaction.id}><div className="transaction-card-header"><div className="transaction-copy"><TransactionContext transaction={transaction} /></div><strong className="financial-value">{moneyOutMinor !== undefined ? "−" : "+"}{formatMinorCurrencyAmount(amountMinor, transaction.currency)}</strong></div><dl className="transaction-card-meta"><div><dt>Booked</dt><dd>{formatPostedDate(transaction.bookedAt)}</dd></div><div><dt>Status</dt><dd className="transaction-status">Booked</dd></div></dl></li>; })}</ol>{effectiveMobileCount < matchingTransactions.length && <Button type="button" variant="secondary" className="transaction-load-more" onClick={() => { const count = Math.min(mobileCount + TRANSACTION_PAGE_SIZE, matchingTransactions.length); setMobileCount(count); mobileCountRef.current = count; writeUrl(criteria, { history: "replace", count }); }}>Load more</Button>}</div>
    </>}
  </>;
}
