import { describe, it, expect } from "vitest";
import { Quarter } from "@prisma/client";
import {
  cn,
  getCurrentQuarter,
  getCurrentYear,
  getQuarterFromDate,
  getQuarterStartDate,
  getQuarterEndDate,
  addWorkingDays,
  formatQuarter,
} from "./utils";

describe("cn utility", () => {
  it("should merge class names correctly", () => {
    const result = cn("px-2 py-1", "text-sm");
    expect(result).toContain("px-2");
    expect(result).toContain("py-1");
    expect(result).toContain("text-sm");
  });

  it("should handle conflicting classes with Tailwind merge", () => {
    const result = cn("px-2", "px-4");
    expect(result).toBe("px-4");
  });

  it("should handle conditional classes", () => {
    const result = cn("px-2", true && "py-1", false && "hidden");
    expect(result).toContain("px-2");
    expect(result).toContain("py-1");
    expect(result).not.toContain("hidden");
  });
});

describe("Quarter utilities", () => {
  describe("getCurrentQuarter", () => {
    it("should return a valid quarter", () => {
      const quarter = getCurrentQuarter();
      expect([Quarter.Q1, Quarter.Q2, Quarter.Q3, Quarter.Q4]).toContain(
        quarter
      );
    });
  });

  describe("getCurrentYear", () => {
    it("should return the current year", () => {
      const year = getCurrentYear();
      const currentYear = new Date().getFullYear();
      expect(year).toBe(currentYear);
    });
  });

  describe("getQuarterFromDate", () => {
    it("should return Q1 for January", () => {
      const date = new Date(2025, 0, 15); // Jan 15, 2025
      expect(getQuarterFromDate(date)).toBe(Quarter.Q1);
    });

    it("should return Q1 for March", () => {
      const date = new Date(2025, 2, 31); // Mar 31, 2025
      expect(getQuarterFromDate(date)).toBe(Quarter.Q1);
    });

    it("should return Q2 for April", () => {
      const date = new Date(2025, 3, 1); // Apr 1, 2025
      expect(getQuarterFromDate(date)).toBe(Quarter.Q2);
    });

    it("should return Q2 for June", () => {
      const date = new Date(2025, 5, 30); // Jun 30, 2025
      expect(getQuarterFromDate(date)).toBe(Quarter.Q2);
    });

    it("should return Q3 for July", () => {
      const date = new Date(2025, 6, 1); // Jul 1, 2025
      expect(getQuarterFromDate(date)).toBe(Quarter.Q3);
    });

    it("should return Q3 for September", () => {
      const date = new Date(2025, 8, 30); // Sep 30, 2025
      expect(getQuarterFromDate(date)).toBe(Quarter.Q3);
    });

    it("should return Q4 for October", () => {
      const date = new Date(2025, 9, 1); // Oct 1, 2025
      expect(getQuarterFromDate(date)).toBe(Quarter.Q4);
    });

    it("should return Q4 for December", () => {
      const date = new Date(2025, 11, 31); // Dec 31, 2025
      expect(getQuarterFromDate(date)).toBe(Quarter.Q4);
    });
  });

  describe("getQuarterStartDate", () => {
    it("should return Jan 1 for Q1", () => {
      const date = getQuarterStartDate(Quarter.Q1, 2025);
      expect(date.getFullYear()).toBe(2025);
      expect(date.getMonth()).toBe(0); // January
      expect(date.getDate()).toBe(1);
    });

    it("should return Apr 1 for Q2", () => {
      const date = getQuarterStartDate(Quarter.Q2, 2025);
      expect(date.getFullYear()).toBe(2025);
      expect(date.getMonth()).toBe(3); // April
      expect(date.getDate()).toBe(1);
    });

    it("should return Jul 1 for Q3", () => {
      const date = getQuarterStartDate(Quarter.Q3, 2025);
      expect(date.getFullYear()).toBe(2025);
      expect(date.getMonth()).toBe(6); // July
      expect(date.getDate()).toBe(1);
    });

    it("should return Oct 1 for Q4", () => {
      const date = getQuarterStartDate(Quarter.Q4, 2025);
      expect(date.getFullYear()).toBe(2025);
      expect(date.getMonth()).toBe(9); // October
      expect(date.getDate()).toBe(1);
    });
  });

  describe("getQuarterEndDate", () => {
    it("should return Mar 31 for Q1", () => {
      const date = getQuarterEndDate(Quarter.Q1, 2025);
      expect(date.getFullYear()).toBe(2025);
      expect(date.getMonth()).toBe(2); // March
      expect(date.getDate()).toBe(31);
    });

    it("should return Jun 30 for Q2", () => {
      const date = getQuarterEndDate(Quarter.Q2, 2025);
      expect(date.getFullYear()).toBe(2025);
      expect(date.getMonth()).toBe(5); // June
      expect(date.getDate()).toBe(30);
    });

    it("should return Sep 30 for Q3", () => {
      const date = getQuarterEndDate(Quarter.Q3, 2025);
      expect(date.getFullYear()).toBe(2025);
      expect(date.getMonth()).toBe(8); // September
      expect(date.getDate()).toBe(30);
    });

    it("should return Dec 31 for Q4", () => {
      const date = getQuarterEndDate(Quarter.Q4, 2025);
      expect(date.getFullYear()).toBe(2025);
      expect(date.getMonth()).toBe(11); // December
      expect(date.getDate()).toBe(31);
    });
  });

  describe("formatQuarter", () => {
    it("should format quarter correctly", () => {
      expect(formatQuarter(Quarter.Q1, 2025)).toBe("Q1 2025");
      expect(formatQuarter(Quarter.Q2, 2025)).toBe("Q2 2025");
      expect(formatQuarter(Quarter.Q3, 2025)).toBe("Q3 2025");
      expect(formatQuarter(Quarter.Q4, 2025)).toBe("Q4 2025");
    });
  });
});

describe("addWorkingDays", () => {
  it("should add 3 working days when no weekends involved", () => {
    // Monday Oct 20, 2025
    const startDate = new Date(2025, 9, 20);
    const result = addWorkingDays(startDate, 3);
    // Should be Thursday Oct 23, 2025
    expect(result.getDate()).toBe(23);
    expect(result.getMonth()).toBe(9);
    expect(result.getFullYear()).toBe(2025);
  });

  it("should skip weekends when adding working days", () => {
    // Friday Oct 17, 2025
    const startDate = new Date(2025, 9, 17);
    const result = addWorkingDays(startDate, 3);
    // Should be Wednesday Oct 22, 2025 (skipping Sat 18, Sun 19)
    expect(result.getDate()).toBe(22);
    expect(result.getMonth()).toBe(9);
    expect(result.getFullYear()).toBe(2025);
  });

  it("should skip multiple weekends when adding many working days", () => {
    // Friday Oct 17, 2025
    const startDate = new Date(2025, 9, 17);
    const result = addWorkingDays(startDate, 10);
    // Should skip 2 weekends and land on Friday Oct 31, 2025
    expect(result.getDate()).toBe(31);
    expect(result.getMonth()).toBe(9);
    expect(result.getFullYear()).toBe(2025);
  });

  it("should handle 0 working days", () => {
    const startDate = new Date(2025, 9, 20);
    const result = addWorkingDays(startDate, 0);
    expect(result.getTime()).toBe(startDate.getTime());
  });

  it("should handle 1 working day", () => {
    // Monday Oct 20, 2025
    const startDate = new Date(2025, 9, 20);
    const result = addWorkingDays(startDate, 1);
    // Should be Tuesday Oct 21, 2025
    expect(result.getDate()).toBe(21);
  });
});
