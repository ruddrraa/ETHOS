import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { employee: true },
    });

    const employeeId = user?.employee?.id;
    if (!employeeId) {
      return NextResponse.json({ error: "No employee profile found" }, { status: 400 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const now = new Date();

    const existing = await prisma.attendance.findUnique({
      where: { employeeId_date: { employeeId, date: today } },
    });

    if (existing?.checkIn) {
      return NextResponse.json(
        { error: "You have already checked in today. Use check-out instead." },
        { status: 409 }
      );
    }

    const body = await req.json().catch(() => ({}));

    const attendance = await prisma.attendance.upsert({
      where: { employeeId_date: { employeeId, date: today } },
      create: {
        employeeId,
        date: today,
        checkIn: now,
        status: "PRESENT",
        notes: body.notes,
        location: body.location,
      },
      update: {
        checkIn: now,
        status: "PRESENT",
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE",
        entity: "Attendance",
        entityId: attendance.id,
        details: `Checked in at ${now.toISOString()}`,
      },
    });

    return NextResponse.json({ success: true, data: attendance });
  } catch (err) {
    console.error("[CHECK_IN_ERROR]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
