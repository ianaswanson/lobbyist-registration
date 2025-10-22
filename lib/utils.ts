import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Quarter } from "@prisma/client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get the current quarter based on the current date
 */
export function getCurrentQuarter(): Quarter {
  const month = new Date().getMonth() + 1; // 1-12
  if (month >= 1 && month <= 3) return Quarter.Q1;
  if (month >= 4 && month <= 6) return Quarter.Q2;
  if (month >= 7 && month <= 9) return Quarter.Q3;
  return Quarter.Q4;
}

/**
 * Get the current year
 */
export function getCurrentYear(): number {
  return new Date().getFullYear();
}

/**
 * Get quarter from a specific date
 */
export function getQuarterFromDate(date: Date): Quarter {
  const month = date.getMonth() + 1; // 1-12
  if (month >= 1 && month <= 3) return Quarter.Q1;
  if (month >= 4 && month <= 6) return Quarter.Q2;
  if (month >= 7 && month <= 9) return Quarter.Q3;
  return Quarter.Q4;
}

/**
 * Get the start date of a quarter
 */
export function getQuarterStartDate(quarter: Quarter, year: number): Date {
  const quarterMap = {
    [Quarter.Q1]: new Date(year, 0, 1), // Jan 1
    [Quarter.Q2]: new Date(year, 3, 1), // Apr 1
    [Quarter.Q3]: new Date(year, 6, 1), // Jul 1
    [Quarter.Q4]: new Date(year, 9, 1), // Oct 1
  };
  return quarterMap[quarter];
}

/**
 * Get the end date of a quarter
 */
export function getQuarterEndDate(quarter: Quarter, year: number): Date {
  const quarterMap = {
    [Quarter.Q1]: new Date(year, 2, 31), // Mar 31
    [Quarter.Q2]: new Date(year, 5, 30), // Jun 30
    [Quarter.Q3]: new Date(year, 8, 30), // Sep 30
    [Quarter.Q4]: new Date(year, 11, 31), // Dec 31
  };
  return quarterMap[quarter];
}

/**
 * Calculate 3 working days from a given date (excludes weekends)
 * This is used for the registration deadline after exceeding 10 hours
 */
export function addWorkingDays(startDate: Date, days: number): Date {
  const result = new Date(startDate);
  let daysAdded = 0;

  while (daysAdded < days) {
    result.setDate(result.getDate() + 1);
    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (result.getDay() !== 0 && result.getDay() !== 6) {
      daysAdded++;
    }
  }

  return result;
}

/**
 * Format quarter for display
 */
export function formatQuarter(quarter: Quarter, year: number): string {
  return `${quarter} ${year}`;
}
