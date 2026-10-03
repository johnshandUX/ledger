export const designSystemNav = [
  { href: "/design-system", label: "Overview" },
  { href: "/design-system/foundations", label: "Foundations" },
  { href: "/design-system/components", label: "Components" },
  { href: "/design-system/patterns", label: "Patterns" },
  { href: "/design-system/ai-guidance", label: "AI guidance" },
  { href: "/design-system/installation", label: "Installation" },
] as const;

export const systemAreas = [
  { title: "Foundations", copy: "Authoritative colour, typography, spacing, radius, border and elevation tokens." },
  { title: "Components", copy: "Reusable React building blocks with small APIs, semantic styling and accessible behaviour." },
  { title: "Financial patterns", copy: "Domain-aware compositions for common banking workflows. This layer is still emerging." },
  { title: "AI guidance", copy: "Constraints and context intended to help agents create coherent Ledger interfaces. Formal machine-readable guidance is planned." },
] as const;

export const examplePrompts = [
  {
    id: "accounts",
    label: "Account overview",
    prompt: "Create an account overview for a commercial banking customer with six accounts across GBP, EUR and USD.",
  },
  {
    id: "payments",
    label: "Payment review",
    prompt: "Create a payment review step for a GBP supplier payment with clear fees and approval status.",
  },
  {
    id: "activity",
    label: "Recent activity",
    prompt: "Create a transaction view that helps a finance team scan recent business activity.",
  },
] as const;

export type ExampleId = (typeof examplePrompts)[number]["id"];
