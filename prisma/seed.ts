import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const company = await prisma.company.upsert({
    where: { id: "default-company" },
    update: {},
    create: {
      id: "default-company",
      name: "OdooVirtual Inc.",
      legalName: "OdooVirtual Technologies Pvt. Ltd.",
      email: "contact@odoovirtual.com",
      phone: "+1-555-0100",
      website: "https://odoovirtual.com",
      address: "123 Enterprise Blvd",
      city: "San Francisco",
      state: "CA",
      country: "USA",
      postalCode: "94105",
      timezone: "America/Los_Angeles",
      currency: "USD",
    },
  });

  await prisma.companySettings.upsert({
    where: { companyId: company.id },
    update: {},
    create: {
      companyId: company.id,
      workStartTime: "09:00",
      workEndTime: "18:00",
      workingDays: "1,2,3,4,5",
      annualLeaveDays: 20,
      sickLeaveDays: 10,
      casualLeaveDays: 5,
    },
  });

  const departments = await Promise.all([
    prisma.department.upsert({
      where: { companyId_name: { companyId: company.id, name: "Engineering" } },
      update: {},
      create: { companyId: company.id, name: "Engineering", description: "Software development team" },
    }),
    prisma.department.upsert({
      where: { companyId_name: { companyId: company.id, name: "Human Resources" } },
      update: {},
      create: { companyId: company.id, name: "Human Resources", description: "HR and people operations" },
    }),
    prisma.department.upsert({
      where: { companyId_name: { companyId: company.id, name: "Sales" } },
      update: {},
      create: { companyId: company.id, name: "Sales", description: "Sales and business development" },
    }),
    prisma.department.upsert({
      where: { companyId_name: { companyId: company.id, name: "Marketing" } },
      update: {},
      create: { companyId: company.id, name: "Marketing", description: "Marketing and brand" },
    }),
  ]);

  const hashedPassword = await bcrypt.hash("Admin@123", 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: "admin@odoovirtual.com" },
    update: {},
    create: {
      email: "admin@odoovirtual.com",
      name: "Super Admin",
      password: hashedPassword,
      role: Role.SUPER_ADMIN,
      emailVerified: new Date(),
    },
  });

  const hrUser = await prisma.user.upsert({
    where: { email: "hr@odoovirtual.com" },
    update: {},
    create: {
      email: "hr@odoovirtual.com",
      name: "Sarah Johnson",
      password: hashedPassword,
      role: Role.HR,
      emailVerified: new Date(),
    },
  });

  const managerUser = await prisma.user.upsert({
    where: { email: "manager@odoovirtual.com" },
    update: {},
    create: {
      email: "manager@odoovirtual.com",
      name: "Michael Chen",
      password: hashedPassword,
      role: Role.MANAGER,
      emailVerified: new Date(),
    },
  });

  const employeeUser = await prisma.user.upsert({
    where: { email: "employee@odoovirtual.com" },
    update: {},
    create: {
      email: "employee@odoovirtual.com",
      name: "John Doe",
      password: hashedPassword,
      role: Role.EMPLOYEE,
      emailVerified: new Date(),
    },
  });

  const managerEmployee = await prisma.employee.upsert({
    where: { employeeId: "EMP-MGR-001" },
    update: {},
    create: {
      employeeId: "EMP-MGR-001",
      userId: managerUser.id,
      companyId: company.id,
      departmentId: departments[0].id,
      jobTitle: "Engineering Manager",
      dateOfJoining: new Date("2022-03-15"),
      status: "ACTIVE",
    },
  });

  await prisma.department.update({
    where: { id: departments[0].id },
    data: { managerId: managerEmployee.id },
  });

  await prisma.employee.upsert({
    where: { employeeId: "EMP-ADM-001" },
    update: {},
    create: {
      employeeId: "EMP-ADM-001",
      userId: superAdmin.id,
      companyId: company.id,
      departmentId: departments[1].id,
      jobTitle: "Chief Technology Officer",
      dateOfJoining: new Date("2020-01-01"),
      status: "ACTIVE",
    },
  });

  await prisma.employee.upsert({
    where: { employeeId: "EMP-HR-001" },
    update: {},
    create: {
      employeeId: "EMP-HR-001",
      userId: hrUser.id,
      companyId: company.id,
      departmentId: departments[1].id,
      jobTitle: "HR Director",
      dateOfJoining: new Date("2021-06-01"),
      status: "ACTIVE",
    },
  });

  const employee = await prisma.employee.upsert({
    where: { employeeId: "EMP-001" },
    update: {},
    create: {
      employeeId: "EMP-001",
      userId: employeeUser.id,
      companyId: company.id,
      departmentId: departments[0].id,
      managerId: managerEmployee.id,
      jobTitle: "Senior Software Engineer",
      dateOfJoining: new Date("2023-01-15"),
      status: "ACTIVE",
    },
  });

  const currentYear = new Date().getFullYear();
  const leaveTypes = ["ANNUAL", "SICK", "CASUAL"] as const;
  const leaveTotals = { ANNUAL: 20, SICK: 10, CASUAL: 5 };

  for (const emp of [employee, managerEmployee]) {
    for (const type of leaveTypes) {
      await prisma.leaveBalance.upsert({
        where: {
          employeeId_leaveType_year: {
            employeeId: emp.id,
            leaveType: type,
            year: currentYear,
          },
        },
        update: {},
        create: {
          employeeId: emp.id,
          leaveType: type,
          totalDays: leaveTotals[type],
          usedDays: 0,
          year: currentYear,
        },
      });
    }
  }

  await prisma.salaryStructure.upsert({
    where: { employeeId: employee.id },
    update: {},
    create: {
      employeeId: employee.id,
      baseSalary: 85000,
      housingAllowance: 5000,
      transportAllowance: 2000,
      medicalAllowance: 1500,
      effectiveFrom: new Date("2023-01-15"),
    },
  });

  await prisma.announcement.createMany({
    data: [
      {
        title: "Welcome to OdooVirtual HRMS",
        content: "We are excited to launch our new HR management platform. Explore all features and reach out to HR for any questions.",
        authorId: hrUser.id,
        isPinned: true,
      },
      {
        title: "Q2 All-Hands Meeting",
        content: "Join us for the quarterly all-hands meeting on Friday at 3 PM PST. Remote employees can join via the company Zoom link.",
        authorId: superAdmin.id,
      },
    ],
    skipDuplicates: true,
  });

  console.log("Seed completed!");
  console.log("\nDemo accounts (password: Admin@123):");
  console.log("  Super Admin: admin@odoovirtual.com");
  console.log("  HR:          hr@odoovirtual.com");
  console.log("  Manager:     manager@odoovirtual.com");
  console.log("  Employee:    employee@odoovirtual.com");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
