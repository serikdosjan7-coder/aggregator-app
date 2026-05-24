// Feature: premium-dark-ui-refactor, Property 1: legacy accent color is absent from all modified source files
import { describe, it } from "vitest";
import * as fc from "fast-check";
import fs from "fs";
import path from "path";

const ROOT = path.resolve(__dirname, "..");

const MODIFIED_FILES = [
  "app/globals.css",
  "app/layout.tsx",
  "app/auth/page.tsx",
  "app/auth/reset-password/page.tsx",
  "app/profile/page.tsx",
  "app/map/page.tsx",
  "app/map/MapView.tsx",
  "app/admin/layout.tsx",
  "app/admin/page.tsx",
  "components/AppFooter.tsx",
  "components/LangSwitcher.tsx",
  "components/LuxuryButton.tsx",
  "components/VehicleIllustration.tsx",
].map((f) => path.join(ROOT, f));

describe("Property 1: Legacy accent color is absent from all modified source files", () => {
  it("no modified file contains #8B0000 or #8b0000", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...MODIFIED_FILES),
        (filePath) => {
          const content = fs.readFileSync(filePath, "utf-8");
          return !content.includes("#8B0000") && !content.includes("#8b0000");
        }
      ),
      { numRuns: 100 }
    );
  });
});
