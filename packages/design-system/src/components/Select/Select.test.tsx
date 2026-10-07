import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Select } from "./Select";

const options = [{ label: "Pound sterling", value: "GBP" }, { label: "Unavailable currency", value: "XXX", disabled: true }];

describe("Select", () => {
  it("renders a labelled native select and preserves option state", () => {
    const html = renderToStaticMarkup(<Select id="currency" label="Currency" name="currency" options={options} placeholder="Choose currency" defaultValue="" />);
    expect(html).toContain('for="currency"');
    expect(html).toContain('<select id="currency"');
    expect(html).toContain('name="currency"');
    expect(html).toContain('<option value="" disabled="" selected="">Choose currency</option>');
    expect(html).toContain('<option value="XXX" disabled="">Unavailable currency</option>');
  });

  it("combines generated and consumer-provided descriptions", () => {
    const html = renderToStaticMarkup(<Select id="currency" label="Currency" options={options} hint="Settlement currency." error="Choose a currency." aria-describedby="currency-help" />);
    expect(html).toContain('aria-describedby="currency-hint currency-error currency-help"');
    expect(html).toContain('aria-invalid="true"');
  });
});
