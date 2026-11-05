import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Client from "@/models/Client";

// GET /api/clients - View all clients with optional search
export async function GET(request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    let query = {};
    if (search && search.trim() !== "") {
      const searchRegex = new RegExp(search.trim(), "i");
      query = {
        $or: [{ name: searchRegex }, { company: searchRegex }, { email: searchRegex }],
      };
    }

    const clients = await Client.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, count: clients.length, data: clients }, { status: 200 });
  } catch (error) {
    console.error("GET /api/clients error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch clients", error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/clients - Add a new client
export async function POST(request) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { name, email, company, phone, notes } = body;

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: "Client name is required" },
        { status: 400 }
      );
    }

    if (!email || !email.trim()) {
      return NextResponse.json(
        { success: false, message: "Client email is required" },
        { status: 400 }
      );
    }

    const newClient = await Client.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      company: company ? company.trim() : "",
      phone: phone ? phone.trim() : "",
      notes: notes ? notes.trim() : "",
    });

    return NextResponse.json(
      { success: true, message: "Client created successfully", data: newClient },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/clients error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create client", error: error.message },
      { status: 500 }
    );
  }
}

