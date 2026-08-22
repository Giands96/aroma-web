import { describe, expect, it } from "vitest";
import { sanitizeErrorMetadata } from "./safe-action";

describe("sanitizeErrorMetadata", () => {
  it("keeps only approved error metadata", () => {
    const error = Object.assign(new Error("Sensitive database failure"), {
      name: "PostgrestError",
      code: "42501",
      status: 403,
      digest: "NEXT_ACTION_DIGEST",
      password: "synthetic-test-password",
      details: "Sensitive database details",
      hint: "Sensitive database hint",
      nested: { authorization: "Bearer sensitive-token" },
    });

    expect(sanitizeErrorMetadata(error)).toEqual({
      name: "PostgrestError",
      code: "42501",
      status: 403,
      digest: "NEXT_ACTION_DIGEST",
    });
  });
});
