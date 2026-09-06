import { describe, it, expect } from "vitest";
import { CS2Parser } from "../src/projects/crosshair/engine/cs2-parser";

describe("CS2Parser", () => {
  it("should parse cl_crosshair commands correctly from raw console output", () => {
    const rawConsole = `
      // Pro player crosshair
      cl_crosshairsize 3.5;
      cl_crosshairgap -2;
      cl_crosshairthickness 1.2;
      cl_crosshaircolor 5;
      cl_crosshaircolor_r 255;
      cl_crosshaircolor_g 105;
      cl_crosshaircolor_b 180;
      cl_crosshairalpha 200;
      cl_crosshairdot 1;
      cl_crosshair_drawoutline 1;
      cl_crosshair_outlinethickness 1.5;
      cl_crosshair_t 0;
      random_game_command 123;
    `;

    const parsed = CS2Parser.parse(rawConsole);
    expect(parsed.cl_crosshairsize).toBe(3.5);
    expect(parsed.cl_crosshairgap).toBe(-2);
    expect(parsed.cl_crosshairthickness).toBe(1.2);
    expect(parsed.cl_crosshaircolor_r).toBe(255);
    expect(parsed.cl_crosshaircolor_g).toBe(105);
    expect(parsed.cl_crosshaircolor_b).toBe(180);
    expect(parsed.cl_crosshairalpha).toBe(200);
    expect(parsed.cl_crosshairdot).toBe(1);
    expect(parsed.cl_crosshair_drawoutline).toBe(1);
    expect(parsed.cl_crosshair_outlinethickness).toBe(1.5);
    expect(parsed.cl_crosshair_t).toBe(0);
  });

  it("should convert parsed CS2 config to ClassicCrosshairLayer", () => {
    const parsed = {
      cl_crosshairsize: 2,
      cl_crosshairthickness: 1,
      cl_crosshairgap: -1,
      cl_crosshaircolor_r: 0,
      cl_crosshaircolor_g: 255,
      cl_crosshaircolor_b: 0,
      cl_crosshairalpha: 255,
      cl_crosshairdot: 1,
      cl_crosshair_drawoutline: 1,
      cl_crosshair_outlinethickness: 1,
    };

    const layer = CS2Parser.toClassicLayer(parsed);
    expect(layer.type).toBe("classic");
    expect(layer.color).toBe("#00ff00");
    expect(layer.dot).toBe(true);
    expect(layer.outline).toBe(true);
  });

  it("should generate valid CS2 console commands from ClassicCrosshairLayer", () => {
    const layer = CS2Parser.toClassicLayer({
      cl_crosshairsize: 3,
      cl_crosshairthickness: 1,
      cl_crosshairgap: -1,
      cl_crosshaircolor_r: 255,
      cl_crosshaircolor_g: 0,
      cl_crosshaircolor_b: 255,
      cl_crosshairalpha: 255,
      cl_crosshairdot: 0,
      cl_crosshair_drawoutline: 1,
      cl_crosshair_outlinethickness: 1,
    });

    const commands = CS2Parser.toCommands(layer);
    expect(commands).toContain("cl_crosshairsize");
    expect(commands).toContain("cl_crosshairgap");
    expect(commands).toContain("cl_crosshaircolor_r 255");
  });
});
