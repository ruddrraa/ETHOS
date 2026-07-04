import { createGroq } from '@ai-sdk/groq';
import { streamText, convertToModelMessages } from 'ai';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY || '',
});

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

async function getHRMSContext(userId: string) {
  // Fetch user with employee profile
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      employee: {
        include: {
          department: true,
          company: true,
          manager: {
            include: { user: { select: { name: true, email: true } } },
          },
          salaryStructure: true,
        },
      },
    },
  });

  if (!user) return '';

  const employee = user.employee;
  const now = new Date();
  const currentYear = now.getFullYear();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  let context = `## Current User Info\n`;
  context += `- Name: ${user.name || 'N/A'}\n`;
  context += `- Email: ${user.email}\n`;
  context += `- Role: ${user.role}\n`;
  context += `- Current Date/Time: ${now.toISOString()}\n`;

  if (employee) {
    context += `\n## Employee Profile\n`;
    context += `- Employee ID: ${employee.employeeId}\n`;
    context += `- Job Title: ${employee.jobTitle}\n`;
    context += `- Employment Type: ${employee.employmentType}\n`;
    context += `- Status: ${employee.status}\n`;
    context += `- Date of Joining: ${employee.dateOfJoining.toISOString().split('T')[0]}\n`;
    context += `- Department: ${employee.department?.name || 'Unassigned'}\n`;
    context += `- Company: ${employee.company.name}\n`;
    if (employee.manager?.user) {
      context += `- Manager: ${employee.manager.user.name} (${employee.manager.user.email})\n`;
    }

    // Attendance - this month
    const attendances = await prisma.attendance.findMany({
      where: {
        employeeId: employee.id,
        date: { gte: startOfMonth },
      },
      orderBy: { date: 'desc' },
      take: 31,
    });

    if (attendances.length > 0) {
      const presentDays = attendances.filter(a => ['PRESENT', 'LATE', 'REMOTE'].includes(a.status)).length;
      const absentDays = attendances.filter(a => a.status === 'ABSENT').length;
      const lateDays = attendances.filter(a => a.status === 'LATE').length;
      const remoteDays = attendances.filter(a => a.status === 'REMOTE').length;
      const totalHours = attendances.reduce((sum, a) => sum + (a.workHours || 0), 0);

      context += `\n## Attendance This Month (${startOfMonth.toISOString().split('T')[0]} to ${now.toISOString().split('T')[0]})\n`;
      context += `- Total Records: ${attendances.length}\n`;
      context += `- Present: ${presentDays} days\n`;
      context += `- Absent: ${absentDays} days\n`;
      context += `- Late: ${lateDays} days\n`;
      context += `- Remote: ${remoteDays} days\n`;
      context += `- Total Work Hours: ${totalHours.toFixed(1)} hours\n`;
      context += `- Avg Hours/Day: ${presentDays > 0 ? (totalHours / presentDays).toFixed(1) : '0'} hours\n`;

      // Last 5 attendance entries
      context += `\n### Recent Attendance:\n`;
      attendances.slice(0, 5).forEach(a => {
        context += `- ${a.date.toISOString().split('T')[0]}: ${a.status}`;
        if (a.checkIn) context += ` | Check-in: ${a.checkIn.toISOString().split('T')[1].substring(0, 5)}`;
        if (a.checkOut) context += ` | Check-out: ${a.checkOut.toISOString().split('T')[1].substring(0, 5)}`;
        if (a.workHours) context += ` | ${a.workHours.toFixed(1)}h`;
        context += `\n`;
      });
    }

    // Leave balances
    const leaveBalances = await prisma.leaveBalance.findMany({
      where: { employeeId: employee.id, year: currentYear },
    });

    if (leaveBalances.length > 0) {
      context += `\n## Leave Balances (${currentYear})\n`;
      leaveBalances.forEach(lb => {
        const remaining = lb.totalDays - lb.usedDays;
        context += `- ${lb.leaveType}: ${remaining}/${lb.totalDays} days remaining (${lb.usedDays} used)\n`;
      });
    }

    // Recent leave requests
    const leaveRequests = await prisma.leaveRequest.findMany({
      where: { employeeId: employee.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    if (leaveRequests.length > 0) {
      context += `\n## Recent Leave Requests\n`;
      leaveRequests.forEach(lr => {
        context += `- ${lr.leaveType} | ${lr.startDate.toISOString().split('T')[0]} to ${lr.endDate.toISOString().split('T')[0]} (${lr.totalDays} days) — Status: ${lr.status} | Reason: ${lr.reason}\n`;
      });
    }

    // Salary structure
    if (employee.salaryStructure) {
      const s = employee.salaryStructure;
      const gross = s.baseSalary + s.housingAllowance + s.transportAllowance + s.medicalAllowance + s.otherAllowances;
      const net = gross - s.taxDeduction - s.otherDeductions;
      context += `\n## Salary Structure\n`;
      context += `- Base Salary: ₹${s.baseSalary.toLocaleString()}\n`;
      context += `- Housing Allowance: ₹${s.housingAllowance.toLocaleString()}\n`;
      context += `- Transport Allowance: ₹${s.transportAllowance.toLocaleString()}\n`;
      context += `- Medical Allowance: ₹${s.medicalAllowance.toLocaleString()}\n`;
      context += `- Other Allowances: ₹${s.otherAllowances.toLocaleString()}\n`;
      context += `- Tax Deduction: ₹${s.taxDeduction.toLocaleString()}\n`;
      context += `- Other Deductions: ₹${s.otherDeductions.toLocaleString()}\n`;
      context += `- Gross Salary: ₹${gross.toLocaleString()}\n`;
      context += `- Net Salary: ₹${net.toLocaleString()}\n`;
    }

    // Latest payslip
    const latestPayslip = await prisma.payslip.findFirst({
      where: { employeeId: employee.id },
      orderBy: { generatedAt: 'desc' },
      include: { payrollRun: true },
    });

    if (latestPayslip) {
      context += `\n## Latest Payslip\n`;
      context += `- Period: ${latestPayslip.payrollRun.title} (${latestPayslip.payrollRun.periodStart.toISOString().split('T')[0]} to ${latestPayslip.payrollRun.periodEnd.toISOString().split('T')[0]})\n`;
      context += `- Base Salary: ₹${latestPayslip.baseSalary.toLocaleString()}\n`;
      context += `- Allowances: ₹${latestPayslip.allowances.toLocaleString()}\n`;
      context += `- Deductions: ₹${latestPayslip.deductions.toLocaleString()}\n`;
      context += `- Net Salary: ₹${latestPayslip.netSalary.toLocaleString()}\n`;
      context += `- Working Days: ${latestPayslip.workingDays} | Present: ${latestPayslip.presentDays} | Leave: ${latestPayslip.leaveDays}\n`;
    }
  }

  // Company-wide stats (for HR/Admin roles)
  if (['SUPER_ADMIN', 'HR', 'MANAGER'].includes(user.role)) {
    const totalEmployees = await prisma.employee.count({ where: { status: 'ACTIVE' } });
    const totalDepartments = await prisma.department.count({ where: { isActive: true } });
    const pendingLeaves = await prisma.leaveRequest.count({ where: { status: 'PENDING' } });
    const todayAttendance = await prisma.attendance.count({
      where: {
        date: {
          gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
        },
        status: { in: ['PRESENT', 'LATE', 'REMOTE'] },
      },
    });

    context += `\n## Company Overview (Admin/HR View)\n`;
    context += `- Total Active Employees: ${totalEmployees}\n`;
    context += `- Total Departments: ${totalDepartments}\n`;
    context += `- Pending Leave Requests: ${pendingLeaves}\n`;
    context += `- Today's Attendance: ${todayAttendance} present\n`;
  }

  // Recent announcements
  const announcements = await prisma.announcement.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: 'desc' },
    take: 3,
  });

  if (announcements.length > 0) {
    context += `\n## Recent Announcements\n`;
    announcements.forEach(a => {
      context += `- **${a.title}** (${a.publishedAt.toISOString().split('T')[0]}): ${a.content.substring(0, 200)}${a.content.length > 200 ? '...' : ''}\n`;
    });
  }

  return context;
}

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { messages } = body;

    // Fetch real HRMS context for the logged-in user
    const hrmsContext = await getHRMSContext(session.user.id);

    const systemPrompt = `You are the ETHOS HRMS AI Assistant — a professional, intelligent HR assistant embedded within ETHOS HRMS.

## Your Capabilities
- Answer questions about the employee's profile, attendance, leave balances, salary, and payslips
- Provide HR policy guidance and explanations
- Analyze attendance patterns and provide insights
- Help with leave management — explain balances, suggest best times to take leave
- Explain payroll breakdowns and salary structures
- Draft professional HR documents (offer letters, experience letters, warning letters, promotion letters)
- Summarize company announcements
- For HR/Admin users: provide company-wide stats, pending approvals, workforce analytics

## Rules
1. Be professional, concise, and helpful. Use markdown formatting.
2. Only use data provided below — NEVER fabricate employee data, attendance records, salary figures, or any other information.
3. If data is not available in the context below, say so clearly and suggest the user check the relevant HRMS module.
4. When showing monetary values, use ₹ (INR) format.
5. When showing dates, use a human-readable format (e.g., "4 Jul 2026").
6. For sensitive salary/payroll questions, confirm the data is for the requesting user only.

## Live HRMS Data for Current User
${hrmsContext || 'No employee profile linked to this user account. The user may need to have their profile set up by an HR admin.'}
`;

    // Convert UIMessage format (parts-based) to model messages (content-based)
    const modelMessages = await convertToModelMessages(messages);

    const result = await streamText({
      model: groq('llama-3.3-70b-versatile'),
      system: systemPrompt,
      messages: modelMessages,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('[AI Chat Error]', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process your request. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
