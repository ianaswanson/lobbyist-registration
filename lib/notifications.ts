/**
 * Notification Scheduler
 * Manages automated notifications for deadlines and compliance
 *
 * For prototype: Manual trigger functions
 * For production: Integrate with cron jobs or task scheduler (e.g., Vercel Cron, AWS EventBridge)
 */

import {
  sendDeadlineReminder,
  sendOverdueNotification,
  sendRegistrationApproval,
  QUARTERLY_DEADLINES,
  daysUntilDeadline,
  EmailRecipient,
} from "./email";

export interface NotificationLog {
  id: string;
  recipientEmail: string;
  recipientName: string;
  type: "deadline_reminder" | "overdue_notice" | "registration_approval";
  sentAt: Date;
  status: "sent" | "failed";
  quarter?: string;
  year?: number;
}

/**
 * Send deadline reminders to all active lobbyists/employers
 * Triggers: 14 days before, 7 days before, 1 day before, day of deadline
 */
export async function sendDeadlineReminders(
  quarter: string,
  year: number,
  daysBeforeDeadline: number
): Promise<NotificationLog[]> {
  const logs: NotificationLog[] = [];

  // Mock data - in production, query database for active lobbyists/employers
  const recipients: EmailRecipient[] = [
    { email: "lobbyist@multco.us", name: "Test Lobbyist" },
    { email: "employer@multco.us", name: "Test Employer" },
  ];

  // Calculate deadline date
  const deadline =
    QUARTERLY_DEADLINES[quarter as keyof typeof QUARTERLY_DEADLINES];
  const deadlineYear = quarter === "Q4" ? year + 1 : year;
  const deadlineDate = new Date(deadlineYear, deadline.month - 1, deadline.day);
  const daysRemaining = daysUntilDeadline(deadlineDate);

  // Only send if we're at the right number of days before deadline
  if (daysRemaining !== daysBeforeDeadline) {
    console.log(
      `Not time to send ${daysBeforeDeadline}-day reminders yet (${daysRemaining} days until deadline)`
    );
    return logs;
  }

  console.log(`Sending ${daysBeforeDeadline}-day deadline reminders...`);

  for (const recipient of recipients) {
    try {
      const success = await sendDeadlineReminder(
        recipient,
        quarter,
        year,
        deadline.label,
        daysRemaining
      );

      logs.push({
        id: `notif-${Date.now()}-${Math.random()}`,
        recipientEmail: recipient.email,
        recipientName: recipient.name || "",
        type: "deadline_reminder",
        sentAt: new Date(),
        status: success ? "sent" : "failed",
        quarter,
        year,
      });
    } catch (error) {
      console.error(`Failed to send reminder to ${recipient.email}:`, error);
      logs.push({
        id: `notif-${Date.now()}-${Math.random()}`,
        recipientEmail: recipient.email,
        recipientName: recipient.name || "",
        type: "deadline_reminder",
        sentAt: new Date(),
        status: "failed",
        quarter,
        year,
      });
    }
  }

  console.log(`Sent ${logs.length} deadline reminders`);
  return logs;
}

/**
 * Send overdue notifications for late reports
 */
export async function sendOverdueNotifications(
  quarter: string,
  year: number
): Promise<NotificationLog[]> {
  const logs: NotificationLog[] = [];

  // Mock data - in production, query database for overdue reports
  const overdueRecipients: Array<EmailRecipient & { daysOverdue: number }> = [
    {
      email: "late.lobbyist@example.com",
      name: "Late Lobbyist",
      daysOverdue: 15,
    },
  ];

  const deadline =
    QUARTERLY_DEADLINES[quarter as keyof typeof QUARTERLY_DEADLINES];

  console.log(`Sending overdue notifications for ${quarter} ${year}...`);

  for (const recipient of overdueRecipients) {
    try {
      const success = await sendOverdueNotification(
        recipient,
        quarter,
        year,
        deadline.label,
        recipient.daysOverdue
      );

      logs.push({
        id: `notif-${Date.now()}-${Math.random()}`,
        recipientEmail: recipient.email,
        recipientName: recipient.name || "",
        type: "overdue_notice",
        sentAt: new Date(),
        status: success ? "sent" : "failed",
        quarter,
        year,
      });
    } catch (error) {
      console.error(
        `Failed to send overdue notice to ${recipient.email}:`,
        error
      );
      logs.push({
        id: `notif-${Date.now()}-${Math.random()}`,
        recipientEmail: recipient.email,
        recipientName: recipient.name || "",
        type: "overdue_notice",
        sentAt: new Date(),
        status: "failed",
        quarter,
        year,
      });
    }
  }

  console.log(`Sent ${logs.length} overdue notifications`);
  return logs;
}

/**
 * Send registration approval notification
 */
export async function sendApprovalNotification(
  recipient: EmailRecipient
): Promise<NotificationLog> {
  try {
    const success = await sendRegistrationApproval(recipient);

    return {
      id: `notif-${Date.now()}-${Math.random()}`,
      recipientEmail: recipient.email,
      recipientName: recipient.name || "",
      type: "registration_approval",
      sentAt: new Date(),
      status: success ? "sent" : "failed",
    };
  } catch (error) {
    console.error(`Failed to send approval to ${recipient.email}:`, error);
    return {
      id: `notif-${Date.now()}-${Math.random()}`,
      recipientEmail: recipient.email,
      recipientName: recipient.name || "",
      type: "registration_approval",
      sentAt: new Date(),
      status: "failed",
    };
  }
}

/**
 * Get upcoming quarterly deadlines
 */
export function getUpcomingDeadlines(): Array<{
  quarter: string;
  year: number;
  date: Date;
  daysUntil: number;
}> {
  const now = new Date();
  const currentYear = now.getFullYear();
  const deadlines: Array<{
    quarter: string;
    year: number;
    date: Date;
    daysUntil: number;
  }> = [];

  // Check all quarters for next 2 years
  for (let yearOffset = 0; yearOffset < 2; yearOffset++) {
    const year = currentYear + yearOffset;

    for (const [quarter, deadline] of Object.entries(QUARTERLY_DEADLINES)) {
      const deadlineYear = quarter === "Q4" ? year + 1 : year;
      const deadlineDate = new Date(
        deadlineYear,
        deadline.month - 1,
        deadline.day
      );

      if (deadlineDate > now) {
        deadlines.push({
          quarter,
          year,
          date: deadlineDate,
          daysUntil: daysUntilDeadline(deadlineDate),
        });
      }
    }
  }

  return deadlines.sort((a, b) => a.daysUntil - b.daysUntil).slice(0, 4);
}

/**
 * For production: This would be called by a cron job
 * Example schedule:
 * - Daily at 9 AM: Check for deadline reminders and overdue notices
 * - Triggered on registration approval: Send approval email
 */
export async function runDailyNotificationCheck(): Promise<{
  deadlineReminders: NotificationLog[];
  overdueNotices: NotificationLog[];
}> {
  console.log("Running daily notification check...");

  const upcomingDeadlines = getUpcomingDeadlines();
  const deadlineReminders: NotificationLog[] = [];
  const overdueNotices: NotificationLog[] = [];

  // Check each upcoming deadline for reminder triggers
  for (const deadline of upcomingDeadlines) {
    // Send reminders at 14, 7, 1, and 0 days before deadline
    if ([14, 7, 1, 0].includes(deadline.daysUntil)) {
      const logs = await sendDeadlineReminders(
        deadline.quarter,
        deadline.year,
        deadline.daysUntil
      );
      deadlineReminders.push(...logs);
    }

    // Check for overdue reports (deadline has passed)
    if (deadline.daysUntil < 0) {
      const logs = await sendOverdueNotifications(
        deadline.quarter,
        deadline.year
      );
      overdueNotices.push(...logs);
    }
  }

  console.log(
    `Daily check complete: ${deadlineReminders.length} reminders, ${overdueNotices.length} overdue notices`
  );

  return { deadlineReminders, overdueNotices };
}
