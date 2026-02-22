import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

/**
 * Unit Tests for Mobile Responsive Styles
 *
 * Verifies that the TSX files contain proper responsive sx prop definitions
 * This test does not require browser automation - just code inspection
 */

describe("Responsive Style Definitions", () => {
  // From services/web, go up to project root
  const projectRoot = path.join(__dirname, "../../../../../..");

  const testFiles = {
    indexPage: path.join(projectRoot, "services/web/src/client/pages/index.tsx"),
    mediaTemplate: path.join(projectRoot, "packages/@liexp/ui/src/templates/MediaTemplateUI.tsx"),
    splitPageTemplate: path.join(projectRoot, "packages/@liexp/ui/src/templates/SplitPageTemplate.tsx"),
    eventTemplate: path.join(projectRoot, "packages/@liexp/ui/src/templates/EventTemplate.tsx"),
    headerComponent: path.join(projectRoot, "packages/@liexp/ui/src/components/Header/Header.tsx"),
    pageTemplate: path.join(projectRoot, "services/web/src/client/templates/PageTemplate.tsx"),
  };

  it("should have responsive marginBottom in index.tsx", () => {
    const content = fs.readFileSync(testFiles.indexPage, "utf-8");

    // Check for responsive margin definitions
    expect(content).toContain("marginBottom: { xs: 4, sm: 6, md: 8 }");
    expect(content).toMatch(/sx=\{\{[\s\S]*marginBottom[\s\S]*xs[\s\S]*4[\s\S]*sm[\s\S]*6[\s\S]*md[\s\S]*8/);
  });

  it("should have responsive padding in templates", () => {
    const content = fs.readFileSync(testFiles.splitPageTemplate, "utf-8");

    // Check for theme.spacing usage
    expect(content).toContain("theme.spacing(1.25)");
    expect(content).toContain("theme.spacing(2.5)");
  });

  it("should have responsive sx prop in MediaTemplateUI", () => {
    const content = fs.readFileSync(testFiles.mediaTemplate, "utf-8");

    // Check for responsive styles
    expect(content).toContain("sx={{ padding: 1.25 }}");
    expect(content).toContain("marginBottom: { xs: 4, sm: 6, md: 8 }");
  });

  it("should use sx prop instead of inline style for EventTemplate", () => {
    const content = fs.readFileSync(testFiles.eventTemplate, "utf-8");

    // Check that inline styles are replaced with sx prop
    expect(content).toContain("sx={{ width:");
    expect(content).toContain("padding: 2");
  });

  it("should remove hardcoded pixel values for spacing", () => {
    const content = fs.readFileSync(testFiles.indexPage, "utf-8");

    // These hardcoded values should be replaced
    expect(content).not.toMatch(/marginBottom:\s*150\s*[}),]/);
    expect(content).not.toMatch(/marginBottom:\s*100\s*[}),]/);
  });

  it("should have responsive Grid sizes for mobile layouts", () => {
    const content = fs.readFileSync(testFiles.indexPage, "utf-8");

    // Check for responsive Grid size definitions
    expect(content).toMatch(/size=\{\{.*xs:.*12.*\}\}/);
    expect(content).toMatch(/columns=\{.*xs:.*1.*sm:.*2/);
  });

  it("should have responsive height in media box", () => {
    const content = fs.readFileSync(testFiles.indexPage, "utf-8");

    // Check for responsive height definitions in media grid
    expect(content).toMatch(/height:.*xs:.*300.*sm:.*400.*md:.*\d+/);
  });

  it("should use theme.spacing or sx with numeric spacing", () => {
    const splitPageContent = fs.readFileSync(testFiles.splitPageTemplate, "utf-8");
    const mediaTemplateContent = fs.readFileSync(testFiles.mediaTemplate, "utf-8");

    // SplitPageTemplate uses theme.spacing()
    expect(splitPageContent).toContain("theme.spacing(");

    // MediaTemplateUI uses sx with numeric spacing (MUI uses 8px base unit)
    expect(mediaTemplateContent).toContain("sx={{");

    // Hard-coded pixels (3+ digits) in padding/margin should be gone
    const splitPagePaddingMatches = splitPageContent.match(/padding:\s*\d{3,}/g);
    expect(splitPagePaddingMatches === null || splitPagePaddingMatches.length === 0).toBe(true);
  });

  it("should have header menu text truncation styles", () => {
    const content = fs.readFileSync(testFiles.headerComponent, "utf-8");

    // Check for text truncation CSS
    expect(content).toContain("textOverflow");
    expect(content).toContain("whiteSpace");
    expect(content).toContain('overflow: "hidden"');
  });

  it("should have responsive layout in PageTemplate", () => {
    const content = fs.readFileSync(testFiles.pageTemplate, "utf-8");

    // Check for responsive flex direction
    expect(content).toContain('flexDirection: { xs: "column", md: "row" }');
    // Check for hidden sidebar on mobile
    expect(content).toContain('display: { xs: "none", md: "block" }');
  });
});
