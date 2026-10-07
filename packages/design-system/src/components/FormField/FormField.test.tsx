import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Input } from "../Input/Input";
import { FormField } from "./FormField";

describe("FormField", () => {
  it("links the label, helper text and validation message to the child control", () => {
    const html = renderToStaticMarkup(
      <FormField
        id="account-name"
        label="Account name"
        helperText="Use the name shown on your account."
        error="Enter an account name."
        required
      >
        <Input label="Account name" placeholder="Enter account name" />
      </FormField>
    );

    expect(html).toContain("Account name");
    expect(html).toContain("Use the name shown on your account.");
    expect(html).toContain("Enter an account name.");
    expect(html).toContain('id="account-name"');
    expect(html).toContain('aria-describedby="account-name-hint account-name-error"');
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain("required");
    expect(html).toContain('class="ledger-input ledger-input--error"');
  });

  it("preserves explicit child state instead of overwriting it with defaults", () => {
    const html = renderToStaticMarkup(<FormField label="Account" helperText="Outer hint" disabled><Input id="custom-account" label="Custom account label" hint="Child hint" disabled={false} required /></FormField>);
    expect(html).toContain('id="custom-account"');
    expect(html).toContain('>Custom account label</label>');
    expect(html).toContain('>Child hint</div>');
    expect(html).not.toContain('disabled=""');
    expect(html).toContain('required=""');
  });
});
