/**
 * Email Notification Utility
 * Handles sending automated email notifications for deadlines and compliance
 *
 * For prototype: Simulates email sending with console logging
 * For production: Integrate with SendGrid, AWS SES, or similar service
 */

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface EmailOptions {
  to: EmailRecipient[];
  subject: string;
  htmlBody: string;
  textBody?: string;
}

/**
 * Send an email
 * For prototype: logs to console
 * For production: integrate with email service
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // Simulate email sending delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    // For prototype: log to console
    console.log("📧 EMAIL SENT:");
    console.log(`To: ${options.to.map((r) => r.email).join(", ")}`);
    console.log(`Subject: ${options.subject}`);
    console.log(
      `Body: ${options.textBody || options.htmlBody.substring(0, 100)}...`
    );

    // For production: integrate with email service
    // Example with SendGrid:
    // await sendGridClient.send({
    //   to: options.to.map(r => r.email),
    //   from: process.env.EMAIL_FROM!,
    //   subject: options.subject,
    //   html: options.htmlBody,
    //   text: options.textBody,
    // })

    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}

/**
 * Send quarterly report deadline reminder
 */
export async function sendDeadlineReminder(
  recipient: EmailRecipient,
  quarter: string,
  year: number,
  dueDate: string,
  daysUntilDue: number
): Promise<boolean> {
  const subject = `Reminder: ${quarter} ${year} Expense Report Due ${dueDate}`;

  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9fafb; }
        .deadline { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
        .button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Multnomah County Lobbyist Registration</h1>
        </div>
        <div class="content">
          <h2>Quarterly Report Deadline Reminder</h2>
          <p>Hello ${recipient.name || ""},</p>
          <p>This is a friendly reminder that your ${quarter} ${year} expense report is due soon.</p>

          <div class="deadline">
            <strong>⏰ Due Date: ${dueDate}</strong><br>
            <strong>${daysUntilDue} days remaining</strong>
          </div>

          <p>Please submit your quarterly expense report by the deadline to remain in compliance with Multnomah County's lobbying ordinance.</p>

          <a href="http://localhost:3000/dashboard" class="button">Submit Report Now</a>

          <h3>What to Report:</h3>
          <ul>
            <li>Total money spent on food, refreshments, and entertainment for lobbying</li>
            <li>Itemized list for any expenditure over $50 to/for any public official</li>
            <li>Copies of any ORS 244.100 notices</li>
          </ul>

          <p>If you have any questions, please contact us at <a href="mailto:lobbying@multco.us">lobbying@multco.us</a> or call (503) 988-3308.</p>
        </div>
        <div class="footer">
          <p>Multnomah County Lobbyist Registration System</p>
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textBody = `
Multnomah County Lobbyist Registration - Quarterly Report Deadline Reminder

Hello ${recipient.name || ""},

This is a friendly reminder that your ${quarter} ${year} expense report is due soon.

Due Date: ${dueDate}
${daysUntilDue} days remaining

Please submit your quarterly expense report by the deadline to remain in compliance with Multnomah County's lobbying ordinance.

Submit your report at: http://localhost:3000/dashboard

What to Report:
- Total money spent on food, refreshments, and entertainment for lobbying
- Itemized list for any expenditure over $50 to/for any public official
- Copies of any ORS 244.100 notices

If you have any questions, please contact us at lobbying@multco.us or call (503) 988-3308.

---
Multnomah County Lobbyist Registration System
This is an automated message. Please do not reply to this email.
  `;

  return sendEmail({
    to: [recipient],
    subject,
    htmlBody,
    textBody,
  });
}

/**
 * Send overdue report notification
 */
export async function sendOverdueNotification(
  recipient: EmailRecipient,
  quarter: string,
  year: number,
  dueDate: string,
  daysOverdue: number
): Promise<boolean> {
  const subject = `OVERDUE: ${quarter} ${year} Expense Report - Action Required`;

  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9fafb; }
        .warning { background-color: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }
        .button { display: inline-block; background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ OVERDUE REPORT NOTICE</h1>
        </div>
        <div class="content">
          <h2>Your Expense Report is Overdue</h2>
          <p>Hello ${recipient.name || ""},</p>

          <div class="warning">
            <strong>⚠️ Your ${quarter} ${year} expense report is overdue</strong><br>
            <strong>Due Date: ${dueDate}</strong><br>
            <strong>${daysOverdue} days overdue</strong>
          </div>

          <p><strong>Immediate action is required.</strong> Failure to submit your quarterly expense report may result in penalties up to $500 as outlined in Multnomah County Ordinance §3.807.</p>

          <a href="http://localhost:3000/dashboard" class="button">Submit Report Immediately</a>

          <p>Please submit your report as soon as possible. If you need assistance or have extenuating circumstances, please contact our office immediately.</p>

          <p><strong>Contact:</strong><br>
          Email: <a href="mailto:lobbying@multco.us">lobbying@multco.us</a><br>
          Phone: (503) 988-3308</p>
        </div>
        <div class="footer">
          <p>Multnomah County Lobbyist Registration System</p>
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textBody = `
OVERDUE REPORT NOTICE - Multnomah County Lobbyist Registration

Hello ${recipient.name || ""},

⚠️ Your ${quarter} ${year} expense report is OVERDUE

Due Date: ${dueDate}
${daysOverdue} days overdue

Immediate action is required. Failure to submit your quarterly expense report may result in penalties up to $500 as outlined in Multnomah County Ordinance §3.807.

Submit your report immediately at: http://localhost:3000/dashboard

If you need assistance or have extenuating circumstances, please contact our office immediately.

Contact:
Email: lobbying@multco.us
Phone: (503) 988-3308

---
Multnomah County Lobbyist Registration System
This is an automated message. Please do not reply to this email.
  `;

  return sendEmail({
    to: [recipient],
    subject,
    htmlBody,
    textBody,
  });
}

/**
 * Send registration approval notification
 */
export async function sendRegistrationApproval(
  recipient: EmailRecipient
): Promise<boolean> {
  const subject = "Your Lobbyist Registration Has Been Approved";

  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #059669; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9fafb; }
        .success { background-color: #d1fae5; border-left: 4px solid #059669; padding: 15px; margin: 20px 0; }
        .button { display: inline-block; background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Registration Approved</h1>
        </div>
        <div class="content">
          <h2>Congratulations!</h2>
          <p>Hello ${recipient.name || ""},</p>

          <div class="success">
            <strong>✅ Your lobbyist registration has been approved</strong>
          </div>

          <p>You are now registered as a lobbyist with Multnomah County. Your registration is active and you can begin submitting quarterly expense reports.</p>

          <a href="http://localhost:3000/dashboard" class="button">Go to Dashboard</a>

          <h3>Important Reminders:</h3>
          <ul>
            <li>Submit quarterly expense reports by the 15th day of the month following each quarter</li>
            <li>Update your registration within 30 days if any information changes</li>
            <li>Maintain records of all lobbying expenses</li>
          </ul>

          <p>If you have any questions, please contact us at <a href="mailto:lobbying@multco.us">lobbying@multco.us</a> or call (503) 988-3308.</p>
        </div>
        <div class="footer">
          <p>Multnomah County Lobbyist Registration System</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: [recipient],
    subject,
    htmlBody,
  });
}

/**
 * Configuration for quarterly report deadlines
 */
export const QUARTERLY_DEADLINES = {
  Q1: { month: 4, day: 15, label: "April 15" }, // Jan-Mar
  Q2: { month: 7, day: 15, label: "July 15" }, // Apr-Jun
  Q3: { month: 10, day: 15, label: "October 15" }, // Jul-Sep
  Q4: { month: 1, day: 15, label: "January 15" }, // Oct-Dec (next year)
};

/**
 * Calculate days until a deadline
 */
export function daysUntilDeadline(deadline: Date): number {
  const today = new Date();
  const diffTime = deadline.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}
