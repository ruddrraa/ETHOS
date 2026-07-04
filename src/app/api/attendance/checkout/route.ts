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

    const attendance = await prisma.attendance.findUnique({
      where: { employeeId_date: { employeeId, date: today } },
    });

    if (!attendance) {
      return NextResponse.json(
        { error: "No check-in found for today. Please check in first." },
        { status: 400 }
      );
    }

    if (!attendance.checkIn) {
      return NextResponse.json(
        { error: "You haven't checked in yet today." },
        { status: 400 }
      );
    }

    if (attendance.checkOut) {
      return NextResponse.json(
        { error: "You have already checked out today." },
        { status: 409 }
      );
    }

    const checkInTime = attendance.checkIn;
    // Calculate hours worked
    const workHours = Math.round(((now.getTime() - checkInTime.getTime()) / (1000 * 60 * 60)) * 100) / 100;

    // Auto determine status
    const status = workHours < 4 ? "HALF_DAY" : "PRESENT";

    const updated = await prisma.attendance.update({
      where: { id: attendance.id },
      data: { checkOut: now, workHours, status },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE",
        entity: "Attendance",
        entityId: attendance.id,
        details: `Checked out at ${now.toISOString()}. Hours worked: ${workHours}`,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error("[CHECK_OUT_ERROR]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
