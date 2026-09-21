import { describe, expect, it } from "vitest";
import nextConfig from "./next.config";

describe("Next.js server actions configuration", () => {
  it("allows the maximum product gallery payload (5 images x 5mb)", () => {
    expect(nextConfig.experimental?.serverActions?.bodySizeLimit).toBe("30mb");
  });

  it("allows the development tunnel origin outside production", () => {
    expect(nextConfig.experimental?.serverActions?.allowedOrigins).toContain(
      "*.brs.devtunnels.ms"
    );
  });

  it("sends security headers on login and dashboard routes", async () => {
    const headersBySource = new Map(
      (await nextConfig.headers?.())?.map((rule) => [rule.source, rule.headers]) ?? [],
    );

    for (const source of ["/login", "/dashboard/:path*"]) {
      const headers = headersBySource.get(source);
      expect(headers).toBeDefined();
      const keys = new Map(headers?.map((header) => [header.key, header.value]));
      expect(keys.get("X-Content-Type-Options")).toBe("nosniff");
      expect(keys.get("Cache-Control")).toBe("no-store");
    }
    expect(headersBySource.get("/login")).toContainEqual({
      key: "X-Frame-Options",
      value: "DENY",
    });
  });
});
