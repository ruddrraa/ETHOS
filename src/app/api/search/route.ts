import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { employee: true },
    });

    if (!user || !user.employee) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const companyId = user.employee.companyId;

    // Perform parallel searches across different entities
    const [employees, departments] = await Promise.all([
      prisma.employee.findMany({
        where: {
          companyId,
          user: {
            name: {
              contains: query,
              mode: "insensitive",
            },
          },
        },
        include: {
          user: {
            select: { name: true, email: true, image: true },
          },
          department: {
            select: { name: true },
          },
        },
        take: 5,
      }),
      prisma.department.findMany({
        where: {
          companyId,
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
        take: 3,
      }),
    ]);

    const results = [
      ...employees.map((emp) => ({
        id: emp.id,
        title: emp.user.name || emp.user.email,
        subtitle: `${emp.jobTitle} ${emp.department ? `• ${emp.department.name}` : ""}`,
        type: "employee",
        href: `/employees/${emp.id}`,
        image: emp.user.image,
      })),
      ...departments.map((dept) => ({
        id: dept.id,
        title: dept.name,
        subtitle: "Department",
        type: "department",
        href: `/departments`,
      })),
    ];

    return NextResponse.json({ results });
  } catch (error) {
    console.error("[SEARCH_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
