import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import Task from "@/models/Task";

// GET /api/tasks/[id] - Get individual task
export async function GET(request, context) {
  try {
    await connectToDatabase();
    const params = await context.params;
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid task ID format" }, { status: 400 });
    }

    const task = await Task.findById(id).populate("projectId", "title deadline status");
    if (!task) {
      return NextResponse.json({ success: false, message: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: task }, { status: 200 });
  } catch (error) {
    console.error("GET /api/tasks/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch task", error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/tasks/[id] - Update task details or status
export async function PUT(request, context) {
  try {
    await connectToDatabase();
    const params = await context.params;
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid task ID format" }, { status: 400 });
    }

    const body = await request.json();
    const { title, description, status, priority, dueDate } = body;

    const updateFields = {
      ...(title && { title: title.trim() }),
      ...(description !== undefined && { description: description.trim() }),
      ...(status && { status }),
      ...(priority && { priority }),
      ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
    };

    const updatedTask = await Task.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
    }).populate("projectId", "title deadline status");

    if (!updatedTask) {
      return NextResponse.json({ success: false, message: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, message: "Task updated successfully", data: updatedTask },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT /api/tasks/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update task", error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[id] - Delete a task
export async function DELETE(request, context) {
  try {
    await connectToDatabase();
    const params = await context.params;
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid task ID format" }, { status: 400 });
    }

    const deletedTask = await Task.findByIdAndDelete(id);
    if (!deletedTask) {
      return NextResponse.json({ success: false, message: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, message: "Task deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/tasks/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete task", error: error.message },
      { status: 500 }
    );
  }
}

