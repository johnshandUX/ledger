import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ReportingHome } from "./ReportingHome";
import { ReportingStateProvider } from "../ReportingStateProvider";
import { BankStateProvider } from "../BankStateProvider";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }), useSearchParams: () => new URLSearchParams() }));

describe("Reporting homepage", () => {
  it("renders the requested reporting hierarchy and illustrative operational data", () => {
    const html = renderToStaticMarkup(<BankStateProvider><ReportingStateProvider><ReportingHome /></ReportingStateProvider></BankStateProvider>);
    expect(html).toContain("Reporting");
    expect(html).toContain("What would you like to report on?");
    expect(html).toContain("My reports");
    expect(html).toContain('role="tablist"');
    expect(html).toContain('aria-selected="true"');
    expect(html).toContain("Connected reporting");
    expect(html).toContain("Monthly transaction report");
    expect(html).toContain("Create report");
    expect(html).toContain('href="/reports/new"');
    expect(html).not.toContain("Simulated connection for demonstration");
    expect(html).not.toContain("Describe the information you need");
    expect(html).not.toContain("Report preparation is not available");
    expect(html).toContain("aria-label=\"Prepare report\"");
    expect(html).toContain("Outgoing transactions across all GBP accounts last month");
  });
});
