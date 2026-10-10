export type PrototypeStep = 1 | 2 | 3 | "confirmation";

export type PrototypeAccount = Readonly<{
  id: string;
  name: string;
  maskedIdentifier: string;
  currency: "GBP";
  availableBalanceMinor: number;
}>;

export type PrototypeRecipient = Readonly<{
  id: string;
  name: string;
  accountName: string;
  accountNumber: string;
  sortCode?: string;
  maskedIdentifier: string;
  currency: "GBP";
}>;

export type PrototypeRecipientGroup = Readonly<{
  id: string;
  name: string;
  recipientIds: readonly string[];
}>;

export type PrototypeRecipientGroupMemberships = Readonly<
  Record<string, readonly string[]>
>;

export type ParsedPrototypeAmount =
  | Readonly<{ valid: true; amountMinor: number }>
  | Readonly<{ valid: false; amountMinor?: undefined }>;

export function isPaymentsV2PrototypeAvailable(
  environment: string | undefined,
): boolean {
  return environment === "development";
}

export function parsePrototypeGbpAmount(value: string): ParsedPrototypeAmount {
  const normalized = value.trim();
  if (!/^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/.test(normalized)) {
    return { valid: false };
  }

  const [pounds, pence = ""] = normalized.split(".");
  const amountMinor = Number(pounds) * 100 + Number(pence.padEnd(2, "0"));
  if (!Number.isSafeInteger(amountMinor) || amountMinor <= 0) {
    return { valid: false };
  }

  return { valid: true, amountMinor };
}

export function isPrototypeFutureDate(
  value: string,
  today = new Date(),
): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const candidate = new Date(Date.UTC(year, month - 1, day));
  if (
    candidate.getUTCFullYear() !== year ||
    candidate.getUTCMonth() !== month - 1 ||
    candidate.getUTCDate() !== day
  ) {
    return false;
  }

  const candidateKey = year * 10_000 + month * 100 + day;
  const todayKey =
    today.getFullYear() * 10_000 +
    (today.getMonth() + 1) * 100 +
    today.getDate();
  return candidateKey > todayKey;
}

export function getPrototypeBusinessDate(
  now = new Date(),
  timeZone = "Europe/London",
): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone,
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function filterPrototypeOptions<
  Option extends { name: string; maskedIdentifier: string },
>(options: readonly Option[], query: string): readonly Option[] {
  const normalized = query.trim().toLocaleLowerCase("en-GB");
  if (!normalized) return options;

  return options.filter((option) =>
    `${option.name} ${option.maskedIdentifier}`
      .toLocaleLowerCase("en-GB")
      .includes(normalized),
  );
}

export function filterPrototypeRecipients(
  recipients: readonly PrototypeRecipient[],
  query: string,
): readonly PrototypeRecipient[] {
  const normalized = query.trim().toLocaleLowerCase("en-GB");
  if (!normalized) return recipients;
  const digits = normalized.replace(/\D/g, "");

  return recipients.filter((recipient) => {
    const text = `${recipient.name} ${recipient.accountName} ${recipient.maskedIdentifier}`
      .toLocaleLowerCase("en-GB");
    return text.includes(normalized) || Boolean(digits && recipient.accountNumber.includes(digits));
  });
}

export function formatPrototypeSortCode(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 6);
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 6)]
    .filter(Boolean)
    .join("-");
}
