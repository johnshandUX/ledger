import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import AccountAdministrationPage from "./account-administration/page";
import AuditActivityPage from "./audit-activity/page";
import BillingPage from "./billing/page";
import BusinessDetailsPage from "./business-details/page";
import SecurityControlsPage from "./security-controls/page";

const nestedPages = [
  ["Business details", BusinessDetailsPage], ["Billing", BillingPage],
  ["Account administration", AccountAdministrationPage], ["Security & controls", SecurityControlsPage], ["Audit & activity", AuditActivityPage],
] as const;

describe("Administration planned destinations", () => {
  it.each(nestedPages)("renders %s with Administration active", (name, Page) => {
    const html = renderToStaticMarkup(<Page />);
    expect(html).toContain(name.replace("&", "&amp;"));
    expect(html).toMatch(/<a[^>]*aria-current="page"[^>]*href="\/admin"|<a[^>]*href="\/admin"[^>]*aria-current="page"/);
    expect(html).toContain("Planned feature");
  });
});
