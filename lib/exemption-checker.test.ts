import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  checkExemption,
  calculateHoursPerQuarter,
  type ExemptionCheckData,
} from "./exemption-checker";

describe("exemption-checker", () => {
  describe("checkExemption", () => {
    const baseData: ExemptionCheckData = {
      hoursPerQuarter: 0,
      isNewsMedia: false,
      isGovernmentOfficial: false,
      isPublicTestimonyOnly: false,
      isRespondingToCountyRequest: false,
      isAdvisoryCommitteeMember: false,
    };

    it("should exempt when hours <= 10", () => {
      const result = checkExemption({ ...baseData, hoursPerQuarter: 10 });

      expect(result.isExempt).toBe(true);
      expect(result.exemptionType).toBe("HOURS_THRESHOLD");
      expect(result.mustRegister).toBe(false);
      expect(result.reason).toContain("10 hours or less");
      expect(result.registrationDeadline).toBeUndefined();
    });

    it("should exempt when hours < 10", () => {
      const result = checkExemption({ ...baseData, hoursPerQuarter: 5 });

      expect(result.isExempt).toBe(true);
      expect(result.exemptionType).toBe("HOURS_THRESHOLD");
      expect(result.mustRegister).toBe(false);
    });

    it("should exempt news media", () => {
      const result = checkExemption({
        ...baseData,
        hoursPerQuarter: 20,
        isNewsMedia: true,
      });

      expect(result.isExempt).toBe(true);
      expect(result.exemptionType).toBe("NEWS_MEDIA");
      expect(result.mustRegister).toBe(false);
      expect(result.reason).toContain("news media");
      expect(result.registrationDeadline).toBeUndefined();
    });

    it("should exempt government officials", () => {
      const result = checkExemption({
        ...baseData,
        hoursPerQuarter: 20,
        isGovernmentOfficial: true,
      });

      expect(result.isExempt).toBe(true);
      expect(result.exemptionType).toBe("GOVERNMENT_OFFICIAL");
      expect(result.mustRegister).toBe(false);
      expect(result.reason).toContain("government official");
      expect(result.registrationDeadline).toBeUndefined();
    });

    it("should exempt public testimony only", () => {
      const result = checkExemption({
        ...baseData,
        hoursPerQuarter: 20,
        isPublicTestimonyOnly: true,
      });

      expect(result.isExempt).toBe(true);
      expect(result.exemptionType).toBe("PUBLIC_TESTIMONY_ONLY");
      expect(result.mustRegister).toBe(false);
      expect(result.reason).toContain("public testimony");
      expect(result.registrationDeadline).toBeUndefined();
    });

    it("should exempt county request responders", () => {
      const result = checkExemption({
        ...baseData,
        hoursPerQuarter: 20,
        isRespondingToCountyRequest: true,
      });

      expect(result.isExempt).toBe(true);
      expect(result.exemptionType).toBe("COUNTY_REQUEST");
      expect(result.mustRegister).toBe(false);
      expect(result.reason).toContain("direct request from Multnomah County");
      expect(result.registrationDeadline).toBeUndefined();
    });

    it("should exempt advisory committee members", () => {
      const result = checkExemption({
        ...baseData,
        hoursPerQuarter: 20,
        isAdvisoryCommitteeMember: true,
      });

      expect(result.isExempt).toBe(true);
      expect(result.exemptionType).toBe("ADVISORY_COMMITTEE");
      expect(result.mustRegister).toBe(false);
      expect(result.reason).toContain("advisory committee");
      expect(result.registrationDeadline).toBeUndefined();
    });

    it("should require registration when hours > 10 and no exemptions", () => {
      const result = checkExemption({
        ...baseData,
        hoursPerQuarter: 15,
      });

      expect(result.isExempt).toBe(false);
      expect(result.exemptionType).toBe("NONE");
      expect(result.mustRegister).toBe(true);
      expect(result.reason).toContain("must register");
      expect(result.registrationDeadline).toBeDefined();
      expect(typeof result.registrationDeadline).toBe("string");
    });

    it("should require registration at exactly 11 hours", () => {
      const result = checkExemption({
        ...baseData,
        hoursPerQuarter: 11,
      });

      expect(result.isExempt).toBe(false);
      expect(result.mustRegister).toBe(true);
    });

    it("should prioritize hours threshold over other exemptions", () => {
      // Even if other exemptions are true, hours <= 10 should win
      const result = checkExemption({
        hoursPerQuarter: 5,
        isNewsMedia: true,
        isGovernmentOfficial: true,
        isPublicTestimonyOnly: true,
        isRespondingToCountyRequest: true,
        isAdvisoryCommitteeMember: true,
      });

      expect(result.exemptionType).toBe("HOURS_THRESHOLD");
    });

    it("should prioritize news media over later exemptions when hours > 10", () => {
      const result = checkExemption({
        hoursPerQuarter: 20,
        isNewsMedia: true,
        isGovernmentOfficial: true,
        isPublicTestimonyOnly: true,
        isRespondingToCountyRequest: false,
        isAdvisoryCommitteeMember: false,
      });

      expect(result.exemptionType).toBe("NEWS_MEDIA");
    });

    it("should handle zero hours", () => {
      const result = checkExemption({
        ...baseData,
        hoursPerQuarter: 0,
      });

      expect(result.isExempt).toBe(true);
      expect(result.exemptionType).toBe("HOURS_THRESHOLD");
    });

    it("should handle high hour counts without exemptions", () => {
      const result = checkExemption({
        ...baseData,
        hoursPerQuarter: 100,
      });

      expect(result.isExempt).toBe(false);
      expect(result.mustRegister).toBe(true);
      expect(result.registrationDeadline).toBeDefined();
    });
  });

  describe("calculateHoursPerQuarter", () => {
    let realDateNow: () => number;

    beforeEach(() => {
      // Save original Date.now
      realDateNow = Date.now;
    });

    afterEach(() => {
      // Restore original Date.now
      Date.now = realDateNow;
      vi.clearAllMocks();
    });

    it("should calculate hours for current quarter (Q1 example)", () => {
      // Mock date to Jan 15, 2025 (Q1)
      vi.setSystemTime(new Date(2025, 0, 15)); // Jan 15, 2025

      const activities = [
        { date: "2025-01-10", hours: 5 }, // Q1
        { date: "2025-02-15", hours: 3 }, // Q1
        { date: "2025-03-20", hours: 2 }, // Q1
        { date: "2024-12-15", hours: 10 }, // Q4 2024 - should not count
        { date: "2025-04-01", hours: 8 }, // Q2 - should not count
      ];

      const result = calculateHoursPerQuarter(activities);
      expect(result).toBe(10); // 5 + 3 + 2
    });

    it("should calculate hours for current quarter (Q2 example)", () => {
      // Mock date to May 15, 2025 (Q2)
      vi.setSystemTime(new Date(2025, 4, 15)); // May 15, 2025

      const activities = [
        { date: "2025-04-10", hours: 4 }, // Q2
        { date: "2025-05-15", hours: 6 }, // Q2
        { date: "2025-06-20", hours: 3 }, // Q2
        { date: "2025-03-15", hours: 5 }, // Q1 - should not count
      ];

      const result = calculateHoursPerQuarter(activities);
      expect(result).toBe(13); // 4 + 6 + 3
    });

    it("should calculate hours for current quarter (Q3 example)", () => {
      // Mock date to Aug 15, 2025 (Q3)
      vi.setSystemTime(new Date(2025, 7, 15)); // Aug 15, 2025

      const activities = [
        { date: "2025-07-10", hours: 2 }, // Q3
        { date: "2025-08-15", hours: 5 }, // Q3
        { date: "2025-09-20", hours: 4 }, // Q3
      ];

      const result = calculateHoursPerQuarter(activities);
      expect(result).toBe(11); // 2 + 5 + 4
    });

    it("should calculate hours for current quarter (Q4 example)", () => {
      // Mock date to Nov 15, 2025 (Q4)
      vi.setSystemTime(new Date(2025, 10, 15)); // Nov 15, 2025

      const activities = [
        { date: "2025-10-10", hours: 3 }, // Q4
        { date: "2025-11-15", hours: 7 }, // Q4
        { date: "2025-12-20", hours: 5 }, // Q4
      ];

      const result = calculateHoursPerQuarter(activities);
      expect(result).toBe(15); // 3 + 7 + 5
    });

    it("should return 0 when no activities in current quarter", () => {
      // Mock date to May 15, 2025 (Q2)
      vi.setSystemTime(new Date(2025, 4, 15));

      const activities = [
        { date: "2025-01-10", hours: 5 }, // Q1
        { date: "2025-07-15", hours: 3 }, // Q3
      ];

      const result = calculateHoursPerQuarter(activities);
      expect(result).toBe(0);
    });

    it("should handle empty activities array", () => {
      const result = calculateHoursPerQuarter([]);
      expect(result).toBe(0);
    });

    it("should handle activities on quarter boundaries", () => {
      // Mock date to Feb 15, 2025 (Q1)
      vi.setSystemTime(new Date(2025, 1, 15));

      const activities = [
        { date: "2025-01-05", hours: 2 }, // Early Q1
        { date: "2025-03-25", hours: 3 }, // Late Q1
        { date: "2025-04-01", hours: 5 }, // First day of Q2 - should not count
      ];

      const result = calculateHoursPerQuarter(activities);
      expect(result).toBe(5); // 2 + 3
    });

    it("should sum decimal hours correctly", () => {
      // Mock date to Jan 15, 2025 (Q1)
      vi.setSystemTime(new Date(2025, 0, 15));

      const activities = [
        { date: "2025-01-10", hours: 2.5 },
        { date: "2025-02-15", hours: 3.75 },
        { date: "2025-03-20", hours: 1.25 },
      ];

      const result = calculateHoursPerQuarter(activities);
      expect(result).toBe(7.5); // 2.5 + 3.75 + 1.25
    });

    it("should handle single activity in quarter", () => {
      // Mock date to Jan 15, 2025 (Q1)
      vi.setSystemTime(new Date(2025, 0, 15));

      const activities = [{ date: "2025-01-10", hours: 8 }];

      const result = calculateHoursPerQuarter(activities);
      expect(result).toBe(8);
    });
  });
});
