"use client";

import { Icon } from "@johnshandux/ledger-design-system/icons";
import Link from "next/link";

export function ReportingHeaderAction() {
  return <Link className="ledger-button ledger-button--primary reporting-create-action" href="/reports/new"><Icon name="add" size="small" aria-hidden="true" />Create report</Link>;
}
