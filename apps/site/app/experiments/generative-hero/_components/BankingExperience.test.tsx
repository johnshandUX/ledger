import { Skeleton } from "@johnshandux/ledger-design-system";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BankingExperience, PanelContent } from "./BankingExperience";
import { prepareGenerativeFinanceData } from "./finance";

describe("generative banking panel lifecycle", () => {
  it("hides decorative skeletons and unresolved content from assistive technology", () => {
    const html = renderToStaticMarkup(
      <PanelContent stage="skeleton" skeleton={<Skeleton className="test-skeleton" />}>
        <span>Generated balance</span>
      </PanelContent>,
    );

    expect(html).toContain('data-generation-stage="skeleton"');
    expect(html).toContain('class="ledger-skeleton test-skeleton" aria-hidden="true"');
    expect(html).toMatch(/generation-layer--content[^>]*aria-hidden="true"/);
  });

  it("removes the skeleton layer once a panel is generated", () => {
    const html = renderToStaticMarkup(
      <PanelContent stage="generated" skeleton={<Skeleton />}>
        <span>Generated balance</span>
      </PanelContent>,
    );

    expect(html).not.toContain("generation-layer--skeleton");
    expect(html).not.toMatch(/generation-layer--content[^>]*aria-hidden/);
  });

  it("renders independently staged panels for both experiences", () => {
    const data = prepareGenerativeFinanceData();
    const cash = renderToStaticMarkup(<BankingExperience data={data} experience="cash" assemblyStep={3} assemblyElapsed={1_200} />);
    const payments = renderToStaticMarkup(<BankingExperience data={data} experience="payments" assemblyStep={3} assemblyElapsed={1_200} />);

    expect(cash).toContain('data-generation-stage="resolving"');
    expect(cash).toContain('data-generation-stage="skeleton"');
    expect(payments).toContain('data-generation-stage="resolving"');
    expect(payments).toContain('data-generation-stage="skeleton"');
  });
});
