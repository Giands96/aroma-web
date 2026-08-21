import { describe, expect, it } from "vitest";
import { ROUTES } from "./routes";

describe("ROUTES", () => {
  it("builds encoded dynamic product, legacy product, and dashboard edit paths", () => {
    expect(ROUTES.PRODUCT("vela aurora")).toBe("/coleccion/producto/vela%20aurora");
    expect(ROUTES.LEGACY_PRODUCT("vela aurora")).toBe("/producto/vela%20aurora");
    expect(ROUTES.DASHBOARD.EDIT_PRODUCT("product/id")).toBe(
      "/dashboard/productos/product%2Fid/editar"
    );
  });
});
