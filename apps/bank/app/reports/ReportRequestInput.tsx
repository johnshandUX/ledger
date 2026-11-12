"use client";

import { Button, Textarea } from "@johnshandux/ledger-design-system";
import { Icon } from "@johnshandux/ledger-design-system/icons";
import { useState } from "react";
import { reportSuggestions } from "./reporting-data";

export function ReportRequestInput() {
  const [request, setRequest] = useState("");

  return (
    <section className="report-request" aria-labelledby="report-request-heading">
      <div className="report-request__heading">
        <span className="report-request__icon" aria-hidden="true"><Icon name="sparkles" size="small" /></span>
        <h2 id="report-request-heading">What would you like to report on?</h2>
      </div>

      <div className="report-request__field">
        <Textarea
          label="Reporting request"
          value={request}
          onChange={(event) => setRequest(event.target.value)}
          rows={2}
        />
        <Button
          className="report-request__submit"
          type="button"
          disabled
          aria-label="Prepare report (available in a future phase)"
          title="Report preparation will be available in a future phase"
        >
          <Icon name="arrow-right" aria-hidden="true" />
        </Button>
      </div>

      <div className="report-request__suggestions" aria-label="Suggested reporting requests"><span>Try:</span>
        {reportSuggestions.map((suggestion) => (
          <button key={suggestion} className="report-request__suggestion" type="button" onClick={() => setRequest(suggestion)}>
            {suggestion}
          </button>
        ))}
      </div>
    </section>
  );
}
