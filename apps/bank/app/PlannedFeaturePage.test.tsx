import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BankStateProvider } from "./BankStateProvider";
import { PlannedFeaturePage, plannedFeatures } from "./PlannedFeaturePage";

describe("PlannedFeaturePage", () => {
  const sidebarRoutes = new Set(["expenses", "reports", "cash-flow", "integrations", "admin"]);

  it.each(Object.values(plannedFeatures))(
    "renders $name as an intentional planned destination",
    (feature) => {
      const html = renderToStaticMarkup(
        <BankStateProvider>
          <PlannedFeaturePage feature={feature} />
        </BankStateProvider>,
      );

      const renderedName = feature.name.replaceAll("&", "&amp;");
      expect(html).toContain(`<h1 id="planned-feature-title">${renderedName}</h1>`);
      expect(html).toContain(feature.summary);
      expect(html).toContain(feature.detail);
      expect(html).toContain(`${renderedName} is planned for a future Ledger release.`);
      if (sidebarRoutes.has(feature.route)) expect(html).toContain('aria-current="page"');
      else expect(html).not.toContain('aria-current="page"');
      expect(html).not.toContain('aria-disabled="true"');
      const panel = html.match(/<section class="planned-feature-panel"[\s\S]*?<\/section>/)?.[0];
      expect(panel).not.toContain("<button");
      expect(panel).not.toContain("<a ");
    },
  );
});
