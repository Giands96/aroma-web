import { describe, expect, it } from "vitest";
import { ROUTES } from "./routes";

describe("ROUTES", () => {
  it("builds encoded dynamic product and dashboard edit paths", () => {
    expect(ROUTES.PRODUCT("vela aurora")).toBe("/coleccion/producto/vela%20aurora");
    expect(ROUTES.DASHBOARD.EDIT_PRODUCT("product/id")).toBe(
      "/dashboard/productos/product%2Fid/editar"
    );
  });
});
