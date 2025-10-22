import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SkipLink } from "./SkipLink";

describe("SkipLink", () => {
  describe("Rendering", () => {
    it("should render skip link with correct text", () => {
      render(<SkipLink />);
      const link = screen.getByRole("link", { name: "Skip to main content" });

      expect(link).toBeInTheDocument();
    });

    it("should link to #main-content", () => {
      render(<SkipLink />);
      const link = screen.getByRole("link");

      expect(link).toHaveAttribute("href", "#main-content");
    });
  });

  describe("Accessibility", () => {
    it("should be hidden by default (sr-only)", () => {
      render(<SkipLink />);
      const link = screen.getByRole("link");

      expect(link.className).toContain("sr-only");
    });

    it("should become visible on focus", () => {
      render(<SkipLink />);
      const link = screen.getByRole("link");

      // Has focus classes that remove sr-only
      expect(link.className).toContain("focus:not-sr-only");
      expect(link.className).toContain("focus:absolute");
    });

    it("should have visible styles when focused", () => {
      render(<SkipLink />);
      const link = screen.getByRole("link");

      // Check for focus styles
      expect(link.className).toContain("focus:bg-blue-600");
      expect(link.className).toContain("focus:text-white");
      expect(link.className).toContain("focus:px-4");
      expect(link.className).toContain("focus:py-2");
    });

    it("should be keyboard accessible", async () => {
      const user = userEvent.setup();
      render(<SkipLink />);
      const link = screen.getByRole("link");

      // Tab to the link (it should be first focusable element)
      await user.tab();

      expect(link).toHaveFocus();
    });

    it("should have ring styles for focus visibility", () => {
      render(<SkipLink />);
      const link = screen.getByRole("link");

      expect(link.className).toContain("focus:ring-2");
      expect(link.className).toContain("focus:ring-blue-500");
      expect(link.className).toContain("focus:ring-offset-2");
    });

    it("should have high z-index when focused", () => {
      render(<SkipLink />);
      const link = screen.getByRole("link");

      expect(link.className).toContain("focus:z-50");
    });

    it("should have rounded corners when focused", () => {
      render(<SkipLink />);
      const link = screen.getByRole("link");

      expect(link.className).toContain("focus:rounded-md");
    });

    it("should remove default outline", () => {
      render(<SkipLink />);
      const link = screen.getByRole("link");

      expect(link.className).toContain("focus:outline-none");
    });
  });

  describe("WCAG Compliance", () => {
    it("should meet WCAG 2.1 AA requirement for skip link", () => {
      render(<SkipLink />);
      const link = screen.getByRole("link", { name: "Skip to main content" });

      // Must be a link
      expect(link.tagName).toBe("A");

      // Must link to main content
      expect(link).toHaveAttribute("href", "#main-content");

      // Must have descriptive text
      expect(link).toHaveTextContent("Skip to main content");
    });

    it("should be the first focusable element (accessibility best practice)", async () => {
      const user = userEvent.setup();
      render(
        <div>
          <SkipLink />
          <button>Other Button</button>
        </div>
      );

      const skipLink = screen.getByRole("link");

      // First tab should focus skip link
      await user.tab();
      expect(skipLink).toHaveFocus();
    });
  });

  describe("Visual Design", () => {
    it("should have shadow for visibility", () => {
      render(<SkipLink />);
      const link = screen.getByRole("link");

      expect(link.className).toContain("focus:shadow-lg");
    });

    it("should be positioned absolutely when focused", () => {
      render(<SkipLink />);
      const link = screen.getByRole("link");

      expect(link.className).toContain("focus:absolute");
      expect(link.className).toContain("focus:top-4");
      expect(link.className).toContain("focus:left-4");
    });
  });
});
