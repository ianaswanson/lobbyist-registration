import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "./badge";

describe("Badge", () => {
  it("should render with default variant", () => {
    render(<Badge>Default Badge</Badge>);
    const badge = screen.getByText("Default Badge");

    expect(badge).toBeInTheDocument();
    expect(badge.tagName).toBe("SPAN");
  });

  it("should apply secondary variant styles", () => {
    render(<Badge variant="secondary">Secondary</Badge>);
    const badge = screen.getByText("Secondary");

    expect(badge).toBeInTheDocument();
    // Secondary variant has bg-secondary class
    expect(badge.className).toContain("bg-secondary");
  });

  it("should apply destructive variant styles", () => {
    render(<Badge variant="destructive">Destructive</Badge>);
    const badge = screen.getByText("Destructive");

    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("bg-destructive");
  });

  it("should apply outline variant styles", () => {
    render(<Badge variant="outline">Outline</Badge>);
    const badge = screen.getByText("Outline");

    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("text-foreground");
  });

  it("should accept custom className", () => {
    render(<Badge className="custom-class">Custom</Badge>);
    const badge = screen.getByText("Custom");

    expect(badge.className).toContain("custom-class");
    // Should still have base badge classes
    expect(badge.className).toContain("inline-flex");
  });

  it("should render with data-slot attribute", () => {
    render(<Badge>Badge</Badge>);
    const badge = screen.getByText("Badge");

    expect(badge).toHaveAttribute("data-slot", "badge");
  });

  it("should forward additional props", () => {
    render(
      <Badge data-testid="custom-badge" aria-label="Status badge">
        Test
      </Badge>
    );
    const badge = screen.getByTestId("custom-badge");

    expect(badge).toHaveAttribute("aria-label", "Status badge");
  });

  it("should handle empty children", () => {
    render(<Badge data-testid="empty-badge"></Badge>);
    const badge = screen.getByTestId("empty-badge");

    expect(badge).toBeInTheDocument();
    expect(badge.tagName).toBe("SPAN");
  });

  it("should render as child component when asChild is true", () => {
    render(
      <Badge asChild>
        <a href="/test">Link Badge</a>
      </Badge>
    );
    const link = screen.getByRole("link", { name: "Link Badge" });

    expect(link).toBeInTheDocument();
    expect(link.tagName).toBe("A");
    // Should have badge classes applied to the link
    expect(link.className).toContain("inline-flex");
  });

  it("should combine variant and custom classes correctly", () => {
    render(
      <Badge variant="destructive" className="m-4 p-2">
        Combined
      </Badge>
    );
    const badge = screen.getByText("Combined");

    expect(badge.className).toContain("bg-destructive"); // variant class
    expect(badge.className).toContain("m-4"); // custom class
    expect(badge.className).toContain("p-2"); // custom class
  });
});
