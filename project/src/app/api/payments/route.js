import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Payment from "@/models/Payment";
import Project from "@/models/Project";

// GET /api/payments - View all payments with optional filtering
export async function GET(request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const projectId = searchParams.get("projectId");

    let query = {};

    if (status && status !== "All") {
      query.status = status;
    }

    if (projectId) {
      query.projectId = projectId;
    }

    const payments = await Payment.find(query)
      .populate({
        path: "projectId",
        select: "title budget clientId",
        populate: {
          path: "clientId",
          select: "name company",
        },
      })
      .sort({ paymentDate: -1, createdAt: -1 });

    // Compute live summary stats
    const allPayments = await Payment.find({});
    const totalReceived = allPayments
      .filter((p) => p.status === "Completed")
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalPending = allPayments
      .filter((p) => p.status === "Pending")
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    const completedCount = allPayments.filter((p) => p.status === "Completed").length;

    return NextResponse.json(
      {
        success: true,
        count: payments.length,
        summary: {
          totalReceived,
          totalPending,
          completedCount,
        },
        data: payments,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/payments error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch payments", error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/payments - Record a new payment
export async function POST(request) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { projectId, amount, paymentDate, paymentMethod, status, notes } = body;

    if (!projectId) {
      return NextResponse.json({ success: false, message: "Associated project is required" }, { status: 400 });
    }

    const projectExists = await Project.findById(projectId);
    if (!projectExists) {
      return NextResponse.json({ success: false, message: "Selected project does not exist" }, { status: 404 });
    }

    if (amount === undefined || amount === null || Number(amount) <= 0) {
      return NextResponse.json(
        { success: false, message: "Payment amount must be greater than zero" },
        { status: 400 }
      );
    }

    const newPayment = await Payment.create({
      projectId,
      amount: Number(amount),
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      paymentMethod: paymentMethod || "Bank Transfer",
      status: status || "Completed",
      notes: notes ? notes.trim() : "",
    });

    const populatedPayment = await Payment.findById(newPayment._id).populate({
      path: "projectId",
      select: "title budget clientId",
      populate: { path: "clientId", select: "name company" },
    });

    return NextResponse.json(
      { success: true, message: "Payment recorded successfully", data: populatedPayment },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/payments error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to record payment", error: error.message },
      { status: 500 }
    );
  }
}

