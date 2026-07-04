import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_PORT === "465",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail(options: {
  to: string | string[];
  subject: string;
  html: string;
}) {
  const from = process.env.SMTP_FROM || '"HRMS" <noreply@hrms.local>';

  try {
    const info = await transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    return info;
  } catch (error) {
    console.error("Email send failed:", error);
    // Don't throw to prevent crashing if SMTP is not configured
    return null;
  }
}

export async function sendLeaveApprovalEmail(options: {
  to: string;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  status: "approved" | "rejected";
  reason?: string;
}) {
  const statusText = options.status === "approved" ? "Approved" : "Rejected";
  const statusColor = options.status === "approved" ? "#10b981" : "#ef4444";

  return sendEmail({
    to: options.to,
    subject: `Leave Request ${statusText} - ${options.leaveType}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${statusColor};">Leave Request ${statusText}</h2>
        <p>Dear ${options.employeeName},</p>
        <p>Your leave request has been <strong>${statusText.toLowerCase()}</strong>.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Type:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${options.leaveType}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>From:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${options.startDate}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>To:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${options.endDate}</td></tr>
        </table>
        ${options.reason ? `<p><strong>Note:</strong> ${options.reason}</p>` : ""}
        <p style="color: #666; font-size: 12px;">ETHOS HRMS</p>
      </div>
    `,
  });
}

export { transporter };
