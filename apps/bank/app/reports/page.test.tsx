import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ReportingHome } from "./ReportingHome";

describe("Reporting homepage", () => {
  it("renders the requested reporting hierarchy and illustrative operational data", () => {
    const html = renderToStaticMarkup(<ReportingHome />);
    expect(html).toContain("Reporting");
    expect(html).toContain("What would you like to report on?");
    expect(html).toContain("My reports");
    expect(html).toContain('role="tablist"');
    expect(html).toContain('aria-selected="true"');
    expect(html).toContain("Connected reporting");
    expect(html).toContain("Monthly transaction report");
    expect(html).toContain("Create report");
    expect(html).toContain("disabled");
    expect(html).not.toContain("Simulated connection for demonstration");
    expect(html).not.toContain("Describe the information you need");
    expect(html).not.toContain("Report preparation is not available");
    expect(html).toContain("Prepare report (available in a future phase)");
  });
});
