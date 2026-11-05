import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import Project from "@/models/Project";
import Client from "@/models/Client";
import Task from "@/models/Task";
import Payment from "@/models/Payment";

// GET /api/projects/[id] - Fetch single project details with tasks, payments & calculated stats
export async function GET(request, context) {
  try {
    await connectToDatabase();
    const params = await context.params;
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid project ID format" }, { status: 400 });
    }

    const project = await Project.findById(id).populate("clientId", "name email company phone notes");
    if (!project) {
      return NextResponse.json({ success: false, message: "Project not found" }, { status: 404 });
    }

    // Fetch tasks belonging to this project
    const tasks = await Task.find({ projectId: id }).sort({ createdAt: -1 });
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "Completed").length;
    // Formula: Progress = (Number of completed tasks / Total number of tasks) * 100 (handling zero tasks safely)
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Fetch payments belonging to this project
    const payments = await Payment.find({ projectId: id }).sort({ paymentDate: -1 });
    const completedPayments = payments.filter((p) => p.status === "Completed");
    const totalPaid = completedPayments.reduce((acc, p) => acc + (p.amount || 0), 0);
    // Formula: Outstanding balance = Project Budget - Total Completed Payments (cannot be negative)
    const outstanding = Math.max(0, (project.budget || 0) - totalPaid);

    return NextResponse.json(
      {
        success: true,
        data: {
          project,
          tasks,
          payments,
          stats: {
            totalTasks,
            completedTasks,
            progress,
            totalPaid,
            outstanding,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/projects/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch project details", error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[id] - Update project details
export async function PUT(request, context) {
  try {
    await connectToDatabase();
    const params = await context.params;
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid project ID format" }, { status: 400 });
    }

    const body = await request.json();
    const { title, description, clientId, budget, startDate, deadline, status, priority } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ success: false, message: "Project title is required" }, { status: 400 });
    }

    if (clientId) {
      const clientExists = await Client.findById(clientId);
      if (!clientExists) {
        return NextResponse.json({ success: false, message: "Selected client does not exist" }, { status: 404 });
      }
    }

    const updateFields = {
      title: title.trim(),
      description: description !== undefined ? description.trim() : "",
      ...(clientId && { clientId }),
      ...(budget !== undefined && { budget: Math.max(0, Number(budget)) }),
      ...(startDate && { startDate: new Date(startDate) }),
      ...(deadline && { deadline: new Date(deadline) }),
      ...(status && { status }),
      ...(priority && { priority }),
    };

    const updatedProject = await Project.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
    }).populate("clientId", "name email company");

    if (!updatedProject) {
      return NextResponse.json({ success: false, message: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, message: "Project updated successfully", data: updatedProject },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT /api/projects/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update project", error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id] - Delete project and cascade associated tasks & payments
export async function DELETE(request, context) {
  try {
    await connectToDatabase();
    const params = await context.params;
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid project ID format" }, { status: 400 });
    }

    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json({ success: false, message: "Project not found" }, { status: 404 });
    }

    // Cascade delete tasks and payments for this project
    await Task.deleteMany({ projectId: id });
    await Payment.deleteMany({ projectId: id });
    await Project.findByIdAndDelete(id);

    return NextResponse.json(
      { success: true, message: "Project and associated tasks/payments deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/projects/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete project", error: error.message },
      { status: 500 }
    );
  }
}

