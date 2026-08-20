import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import ProductGallery from "./ProductGallery";

describe("ProductGallery", () => {
  it("renders dot buttons instead of image thumbnails", () => {
    const markup = renderToStaticMarkup(createElement(ProductGallery, {
      productName: "Vela Aurora",
      images: [
        { secure_url: "https://example.com/first.jpg" },
        { secure_url: "https://example.com/second.jpg" },
      ],
    }));

    expect(markup).toContain('aria-pressed="true"');
    expect(markup).toContain('aria-pressed="false"');
    expect(markup).toContain("size-2");
    expect(markup).not.toContain('alt=""');
  });
});
