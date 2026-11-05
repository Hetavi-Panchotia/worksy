import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import Client from "@/models/Client";
import Project from "@/models/Project";
import Task from "@/models/Task";
import Payment from "@/models/Payment";

// GET /api/clients/[id] - Get single client details along with their projects
export async function GET(request, context) {
  try {
    await connectToDatabase();
    const params = await context.params;
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid client ID format" }, { status: 400 });
    }

    const client = await Client.findById(id);
    if (!client) {
      return NextResponse.json({ success: false, message: "Client not found" }, { status: 404 });
    }

    // Fetch projects associated with this client
    const projects = await Project.find({ clientId: id }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: { client, projects } }, { status: 200 });
  } catch (error) {
    console.error("GET /api/clients/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch client", error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/clients/[id] - Update client information
export async function PUT(request, context) {
  try {
    await connectToDatabase();
    const params = await context.params;
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid client ID format" }, { status: 400 });
    }

    const body = await request.json();
    const { name, email, company, phone, notes } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, message: "Client name is required" }, { status: 400 });
    }

    if (!email || !email.trim()) {
      return NextResponse.json({ success: false, message: "Client email is required" }, { status: 400 });
    }

    const updatedClient = await Client.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        company: company !== undefined ? company.trim() : "",
        phone: phone !== undefined ? phone.trim() : "",
        notes: notes !== undefined ? notes.trim() : "",
      },
      { new: true, runValidators: true }
    );

    if (!updatedClient) {
      return NextResponse.json({ success: false, message: "Client not found" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, message: "Client updated successfully", data: updatedClient },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT /api/clients/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update client", error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/clients/[id] - Delete client and cascade associated projects, tasks, and payments
export async function DELETE(request, context) {
  try {
    await connectToDatabase();
    const params = await context.params;
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid client ID format" }, { status: 400 });
    }

    const client = await Client.findById(id);
    if (!client) {
      return NextResponse.json({ success: false, message: "Client not found" }, { status: 404 });
    }

    // Find all projects belonging to this client to clean up tasks & payments
    const clientProjects = await Project.find({ clientId: id }).select("_id");
    const projectIds = clientProjects.map((p) => p._id);

    if (projectIds.length > 0) {
      await Task.deleteMany({ projectId: { $in: projectIds } });
      await Payment.deleteMany({ projectId: { $in: projectIds } });
      await Project.deleteMany({ clientId: id });
    }

    await Client.findByIdAndDelete(id);

    return NextResponse.json(
      { success: true, message: "Client and associated records deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/clients/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete client", error: error.message },
      { status: 500 }
    );
  }
}

