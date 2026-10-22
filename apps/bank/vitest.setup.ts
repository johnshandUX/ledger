import { vi } from "vitest";

const { routerPushMock } = vi.hoisted(() => ({
  routerPushMock: vi.fn(),
}));

export function getRouterPushMock() {
  return routerPushMock;
}

vi.mock("next/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/navigation")>()),
  useRouter: () => ({
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
    push: routerPushMock,
    refresh: vi.fn(),
    replace: vi.fn(),
  }),
}));
