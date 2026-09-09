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
    expect(html).toContain('aria-describedby="account-name-helper account-name-error"');
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain("required");
  });
});
