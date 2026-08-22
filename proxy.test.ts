import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  updateSession: vi.fn(),
}));

vi.mock("./app/shared/lib/supabase/proxy", () => ({
  updateSession: mocks.updateSession,
}));

import { proxy } from "./proxy";

function request(pathname: string) {
  return new NextRequest(`http://localhost${pathname}`);
}

describe("proxy", () => {
  it("continues public requests without refreshing the Supabase session", async () => {
    const response = await proxy(request("/coleccion"));

    expect(mocks.updateSession).not.toHaveBeenCalled();
    expect(response.status).toBe(200);
  });
});