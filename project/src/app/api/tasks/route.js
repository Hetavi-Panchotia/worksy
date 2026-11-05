import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Task from "@/models/Task";
import Project from "@/models/Project";

// GET /api/tasks - View all tasks with filtering
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

    const tasks = await Task.find(query)
      .populate("projectId", "title deadline status")
      .sort({ dueDate: 1, createdAt: -1 });

    return NextResponse.json({ success: true, count: tasks.length, data: tasks }, { status: 200 });
  } catch (error) {
    console.error("GET /api/tasks error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch tasks", error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/tasks - Create a new task
export async function POST(request) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { title, description, projectId, status, priority, dueDate } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ success: false, message: "Task title is required" }, { status: 400 });
    }

    if (!projectId) {
      return NextResponse.json({ success: false, message: "Associated project is required" }, { status: 400 });
    }

    const projectExists = await Project.findById(projectId);
    if (!projectExists) {
      return NextResponse.json({ success: false, message: "Selected project does not exist" }, { status: 404 });
    }

    const newTask = await Task.create({
      title: title.trim(),
      description: description ? description.trim() : "",
      projectId,
      status: status || "To Do",
      priority: priority || "Medium",
      dueDate: dueDate ? new Date(dueDate) : null,
    });

    const populatedTask = await Task.findById(newTask._id).populate("projectId", "title deadline status");

    return NextResponse.json(
      { success: true, message: "Task created successfully", data: populatedTask },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/tasks error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create task", error: error.message },
      { status: 500 }
    );
  }
}

