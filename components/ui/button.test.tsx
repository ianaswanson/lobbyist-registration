import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./button";

describe("Button", () => {
  describe("Rendering", () => {
    it("should render with default variant and size", () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole("button", { name: "Click me" });

      expect(button).toBeInTheDocument();
      expect(button.tagName).toBe("BUTTON");
      expect(button.className).toContain("bg-primary");
      expect(button.className).toContain("h-9");
    });

    it("should render with data-slot attribute", () => {
      render(<Button>Button</Button>);
      const button = screen.getByRole("button");

      expect(button).toHaveAttribute("data-slot", "button");
    });
  });

  describe("Variants", () => {
    it("should apply destructive variant styles", () => {
      render(<Button variant="destructive">Delete</Button>);
      const button = screen.getByRole("button");

      expect(button.className).toContain("bg-destructive");
    });

    it("should apply outline variant styles", () => {
      render(<Button variant="outline">Outline</Button>);
      const button = screen.getByRole("button");

      expect(button.className).toContain("border");
      expect(button.className).toContain("bg-background");
    });

    it("should apply secondary variant styles", () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole("button");

      expect(button.className).toContain("bg-secondary");
    });

    it("should apply ghost variant styles", () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole("button");

      expect(button.className).toContain("hover:bg-accent");
    });

    it("should apply link variant styles", () => {
      render(<Button variant="link">Link</Button>);
      const button = screen.getByRole("button");

      expect(button.className).toContain("underline-offset-4");
    });
  });

  describe("Sizes", () => {
    it("should apply small size", () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByRole("button");

      expect(button.className).toContain("h-8");
    });

    it("should apply large size", () => {
      render(<Button size="lg">Large</Button>);
      const button = screen.getByRole("button");

      expect(button.className).toContain("h-10");
    });

    it("should apply icon size", () => {
      render(<Button size="icon">⚙</Button>);
      const button = screen.getByRole("button");

      expect(button.className).toContain("size-9");
    });

    it("should apply icon-sm size", () => {
      render(<Button size="icon-sm">⚙</Button>);
      const button = screen.getByRole("button");

      expect(button.className).toContain("size-8");
    });

    it("should apply icon-lg size", () => {
      render(<Button size="icon-lg">⚙</Button>);
      const button = screen.getByRole("button");

      expect(button.className).toContain("size-10");
    });
  });

  describe("Interactions", () => {
    it("should handle click events", async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Button onClick={handleClick}>Click me</Button>);
      const button = screen.getByRole("button");

      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should not trigger click when disabled", async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(
        <Button onClick={handleClick} disabled>
          Disabled
        </Button>
      );
      const button = screen.getByRole("button");

      await user.click(button);

      expect(handleClick).not.toHaveBeenCalled();
      expect(button).toBeDisabled();
    });

    it("should apply disabled opacity styles", () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole("button");

      expect(button.className).toContain("disabled:opacity-50");
    });
  });

  describe("Custom Props", () => {
    it("should accept custom className", () => {
      render(<Button className="custom-class">Custom</Button>);
      const button = screen.getByRole("button");

      expect(button.className).toContain("custom-class");
      expect(button.className).toContain("inline-flex");
    });

    it("should forward type prop", () => {
      render(<Button type="submit">Submit</Button>);
      const button = screen.getByRole("button");

      expect(button).toHaveAttribute("type", "submit");
    });

    it("should forward aria attributes", () => {
      render(
        <Button aria-label="Custom label" aria-pressed={true}>
          Toggle
        </Button>
      );
      const button = screen.getByRole("button");

      expect(button).toHaveAttribute("aria-label", "Custom label");
      expect(button).toHaveAttribute("aria-pressed", "true");
    });
  });

  describe("AsChild Prop", () => {
    it("should render as child component when asChild is true", () => {
      render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>
      );
      const link = screen.getByRole("link", { name: "Link Button" });

      expect(link).toBeInTheDocument();
      expect(link.tagName).toBe("A");
      expect(link.className).toContain("inline-flex");
    });

    it("should apply button styles to child component", () => {
      render(
        <Button asChild variant="destructive" size="lg">
          <a href="/delete">Delete Link</a>
        </Button>
      );
      const link = screen.getByRole("link");

      expect(link.className).toContain("bg-destructive");
      expect(link.className).toContain("h-10");
    });
  });

  describe("Combinations", () => {
    it("should combine variant, size, and custom class", () => {
      render(
        <Button variant="outline" size="sm" className="m-4">
          Combined
        </Button>
      );
      const button = screen.getByRole("button");

      expect(button.className).toContain("border"); // variant
      expect(button.className).toContain("h-8"); // size
      expect(button.className).toContain("m-4"); // custom
    });
  });

  describe("Accessibility", () => {
    it("should be keyboard accessible", async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Button onClick={handleClick}>Keyboard</Button>);
      const button = screen.getByRole("button");

      button.focus();
      expect(button).toHaveFocus();

      await user.keyboard("{Enter}");
      expect(handleClick).toHaveBeenCalled();
    });

    it("should support aria-invalid attribute", () => {
      render(<Button aria-invalid={true}>Invalid</Button>);
      const button = screen.getByRole("button");

      expect(button).toHaveAttribute("aria-invalid", "true");
      expect(button.className).toContain("aria-invalid:ring-destructive");
    });
  });
});
