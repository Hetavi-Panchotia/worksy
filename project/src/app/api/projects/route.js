import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Project from "@/models/Project";
import Client from "@/models/Client";
import Task from "@/models/Task";
import Payment from "@/models/Payment";

// GET /api/projects - View all projects with filtering and search
export async function GET(request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const clientId = searchParams.get("clientId");

    let query = {};

    if (search && search.trim() !== "") {
      query.title = { $regex: search.trim(), $options: "i" };
    }

    if (status && status !== "All") {
      query.status = status;
    }

    if (clientId) {
      query.clientId = clientId;
    }

    // Retrieve projects and populate associated client details
    const projects = await Project.find(query)
      .populate("clientId", "name email company")
      .sort({ createdAt: -1 })
      .lean();

    // Enrich projects with task progress count and completed payments summary
    const enrichedProjects = await Promise.all(
      projects.map(async (project) => {
        const tasks = await Task.find({ projectId: project._id }).select("status").lean();
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter((t) => t.status === "Completed").length;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        const payments = await Payment.find({ projectId: project._id, status: "Completed" })
          .select("amount")
          .lean();
        const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
        const outstanding = Math.max(0, (project.budget || 0) - totalPaid);

        return {
          ...project,
          taskStats: {
            total: totalTasks,
            completed: completedTasks,
            progress,
          },
          financials: {
            totalPaid,
            outstanding,
          },
        };
      })
    );

    return NextResponse.json(
      { success: true, count: enrichedProjects.length, data: enrichedProjects },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/projects error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch projects", error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create a new project
export async function POST(request) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { title, description, clientId, budget, startDate, deadline, status, priority } = body;

    // Validation
    if (!title || !title.trim()) {
      return NextResponse.json({ success: false, message: "Project title is required" }, { status: 400 });
    }

    if (!clientId) {
      return NextResponse.json({ success: false, message: "Associated client is required" }, { status: 400 });
    }

    // Check if client exists
    const clientExists = await Client.findById(clientId);
    if (!clientExists) {
      return NextResponse.json({ success: false, message: "Selected client does not exist" }, { status: 404 });
    }

    if (budget === undefined || budget === null || Number(budget) < 0) {
      return NextResponse.json({ success: false, message: "Valid budget is required (>= 0)" }, { status: 400 });
    }

    if (!deadline) {
      return NextResponse.json({ success: false, message: "Project deadline is required" }, { status: 400 });
    }

    const newProject = await Project.create({
      title: title.trim(),
      description: description ? description.trim() : "",
      clientId,
      budget: Number(budget),
      startDate: startDate ? new Date(startDate) : new Date(),
      deadline: new Date(deadline),
      status: status || "Planning",
      priority: priority || "Medium",
    });

    // Populate client before returning
    const populatedProject = await Project.findById(newProject._id).populate("clientId", "name email company");

    return NextResponse.json(
      { success: true, message: "Project created successfully", data: populatedProject },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/projects error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create project", error: error.message },
      { status: 500 }
    );
  }
}

