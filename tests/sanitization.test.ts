import { describe, it, expect } from "vitest";
import { ImageProcessor } from "../src/projects/crosshair/engine/image-processor";

describe("SVG Sanitization", () => {
  it("should strip out script tags and malicious attributes from SVG", () => {
    const maliciousSvg = `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="40" fill="red" onload="alert('xss')" onclick="doMalicious()" />
        <script>window.maliciousCode = true;</script>
      </svg>
    `;

    const sanitized = ImageProcessor.sanitizeSvg(maliciousSvg);
    expect(sanitized).not.toContain("<script>");
    expect(sanitized).not.toContain("alert('xss')");
    expect(sanitized).not.toContain("onclick");
    expect(sanitized).not.toContain("onload");
    expect(sanitized).toContain("<circle");
    expect(sanitized).toContain('fill="red"');
  });
});
