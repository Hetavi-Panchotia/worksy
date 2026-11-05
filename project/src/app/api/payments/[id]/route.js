import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import Payment from "@/models/Payment";

// GET /api/payments/[id] - Get single payment record
export async function GET(request, context) {
  try {
    await connectToDatabase();
    const params = await context.params;
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid payment ID format" }, { status: 400 });
    }

    const payment = await Payment.findById(id).populate({
      path: "projectId",
      select: "title budget clientId",
      populate: { path: "clientId", select: "name company" },
    });

    if (!payment) {
      return NextResponse.json({ success: false, message: "Payment not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: payment }, { status: 200 });
  } catch (error) {
    console.error("GET /api/payments/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch payment", error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/payments/[id] - Update payment details
export async function PUT(request, context) {
  try {
    await connectToDatabase();
    const params = await context.params;
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid payment ID format" }, { status: 400 });
    }

    const body = await request.json();
    const { amount, paymentDate, paymentMethod, status, notes } = body;

    const updateFields = {
      ...(amount !== undefined && { amount: Number(amount) }),
      ...(paymentDate && { paymentDate: new Date(paymentDate) }),
      ...(paymentMethod && { paymentMethod }),
      ...(status && { status }),
      ...(notes !== undefined && { notes: notes.trim() }),
    };

    const updatedPayment = await Payment.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
    }).populate({
      path: "projectId",
      select: "title budget clientId",
      populate: { path: "clientId", select: "name company" },
    });

    if (!updatedPayment) {
      return NextResponse.json({ success: false, message: "Payment not found" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, message: "Payment updated successfully", data: updatedPayment },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT /api/payments/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update payment", error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/payments/[id] - Delete payment record
export async function DELETE(request, context) {
  try {
    await connectToDatabase();
    const params = await context.params;
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid payment ID format" }, { status: 400 });
    }

    const deletedPayment = await Payment.findByIdAndDelete(id);
    if (!deletedPayment) {
      return NextResponse.json({ success: false, message: "Payment not found" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, message: "Payment record deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/payments/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete payment", error: error.message },
      { status: 500 }
    );
  }
}

