import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Client from "@/models/Client";
import Project from "@/models/Project";
import Task from "@/models/Task";
import Payment from "@/models/Payment";

export async function GET() {
  try {
    await connectToDatabase();

    // 1. Client counts
    const totalClients = await Client.countDocuments();

    // 2. Projects & Status Distribution
    const allProjects = await Project.find()
      .populate("clientId", "name company")
      .sort({ createdAt: -1 })
      .lean();

    const totalProjects = allProjects.length;
    const completedProjects = allProjects.filter((p) => p.status === "Completed").length;
    const activeProjects = allProjects.filter((p) =>
      ["Planning", "In Progress", "On Hold"].includes(p.status)
    ).length;

    // Status breakdown
    const statusDistribution = {
      Planning: allProjects.filter((p) => p.status === "Planning").length,
      "In Progress": allProjects.filter((p) => p.status === "In Progress").length,
      "On Hold": allProjects.filter((p) => p.status === "On Hold").length,
      Completed: completedProjects,
      Cancelled: allProjects.filter((p) => p.status === "Cancelled").length,
    };

    // 3. Payments calculation
    const allPayments = await Payment.find()
      .populate({
        path: "projectId",
        select: "title clientId",
        populate: { path: "clientId", select: "name" },
      })
      .sort({ paymentDate: -1 })
      .lean();

    const totalReceived = allPayments
      .filter((p) => p.status === "Completed")
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    // Calculate total outstanding payments across all non-cancelled projects
    let totalOutstanding = 0;
    const enrichedProjects = await Promise.all(
      allProjects.map(async (project) => {
        const projectPayments = await Payment.find({
          projectId: project._id,
          status: "Completed",
        }).select("amount");
        const paid = projectPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
        const outstanding = Math.max(0, (project.budget || 0) - paid);

        if (project.status !== "Cancelled") {
          totalOutstanding += outstanding;
        }

        const projectTasks = await Task.find({ projectId: project._id }).select("status");
        const totalTasks = projectTasks.length;
        const completedTasks = projectTasks.filter((t) => t.status === "Completed").length;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        return {
          ...project,
          paid,
          outstanding,
          progress,
          taskCount: totalTasks,
        };
      })
    );

    // 4. Upcoming Deadlines (active projects ordered by earliest deadline)
    const upcomingDeadlines = allProjects
      .filter((p) => p.status !== "Completed" && p.status !== "Cancelled" && p.deadline)
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      .slice(0, 5);

    // 5. Recent Projects (first 5)
    const recentProjects = enrichedProjects.slice(0, 5);

    // 6. Recent Payments (first 5)
    const recentPayments = allPayments.slice(0, 5);

    return NextResponse.json(
      {
        success: true,
        data: {
          metrics: {
            totalClients,
            totalProjects,
            activeProjects,
            completedProjects,
            totalReceived,
            totalOutstanding,
          },
          statusDistribution,
          recentProjects,
          upcomingDeadlines,
          recentPayments,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/dashboard error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to generate dashboard statistics", error: error.message },
      { status: 500 }
    );
  }
}

