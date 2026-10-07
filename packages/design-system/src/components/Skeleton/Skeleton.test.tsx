import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Skeleton } from "./Skeleton";

describe("Skeleton", () => {
  it("is decorative and passes through layout attributes", () => {
    const html = renderToStaticMarkup(<Skeleton className="account-row" style={{ width: "12rem" }} />);
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain("ledger-skeleton account-row");
    expect(html).toContain("width:12rem");
  });

  it("does not render forced child content", () => {
    const UnsafeSkeleton = Skeleton as (props: { children: string }) => React.ReactNode;
    const html = renderToStaticMarkup(<UnsafeSkeleton>Account balance</UnsafeSkeleton>);
    expect(html).not.toContain("Account balance");
  });
});
