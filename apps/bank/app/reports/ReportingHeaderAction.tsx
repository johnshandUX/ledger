"use client";

import { Button } from "@johnshandux/ledger-design-system";
import { Icon } from "@johnshandux/ledger-design-system/icons";

export function ReportingHeaderAction() {
  return <Button className="reporting-create-action" type="button" disabled><Icon name="add" size="small" aria-hidden="true" />Create report</Button>;
}
