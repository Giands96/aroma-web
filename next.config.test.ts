import { describe, expect, it } from "vitest";
import nextConfig from "./next.config";

describe("Next.js server actions configuration", () => {
  it("allows the maximum product gallery payload", () => {
    expect(nextConfig.experimental?.serverActions?.bodySizeLimit).toBe("30mb");
  });

  it("allows the development tunnel origin outside production", () => {
    expect(nextConfig.experimental?.serverActions?.allowedOrigins).toContain(
      "*.brs.devtunnels.ms"
    );
  });
});
