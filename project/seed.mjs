import mongoose from "mongoose";

// Load environment variables natively from .env.local in Node 20+
try {
  process.loadEnvFile(".env.local");
} catch (e) {
  // If .env.local is missing, try .env or fallback to default
}

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/freelanceflow";

// Schemas
const ClientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  company: String,
  phone: String,
  notes: String,
  createdAt: { type: Date, default: Date.now },
});

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
  budget: { type: Number, required: true },
  startDate: { type: Date, default: Date.now },
  deadline: { type: Date, required: true },
  status: { type: String, default: "Planning" },
  priority: { type: String, default: "Medium" },
  createdAt: { type: Date, default: Date.now },
});

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  status: { type: String, default: "To Do" },
  priority: { type: String, default: "Medium" },
  dueDate: Date,
  createdAt: { type: Date, default: Date.now },
});

const PaymentSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  amount: { type: Number, required: true },
  paymentDate: { type: Date, default: Date.now },
  paymentMethod: { type: String, default: "Bank Transfer" },
  status: { type: String, default: "Completed" },
  notes: String,
  createdAt: { type: Date, default: Date.now },
});

const Client = mongoose.models.Client || mongoose.model("Client", ClientSchema);
const Project = mongoose.models.Project || mongoose.model("Project", ProjectSchema);
const Task = mongoose.models.Task || mongoose.model("Task", TaskSchema);
const Payment = mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);

async function seed() {
  console.log("🌱 Connecting to MongoDB:", MONGODB_URI.replace(/:[^:]*@/, ":****@"));
  await mongoose.connect(MONGODB_URI);

  console.log("🧹 Clearing existing demo data...");
  await Client.deleteMany({});
  await Project.deleteMany({});
  await Task.deleteMany({});
  await Payment.deleteMany({});

  console.log("👥 Inserting sample clients...");
  const client1 = await Client.create({
    name: "Sarah Jenkins",
    email: "sarah@apexstudio.io",
    company: "Apex Studio",
    phone: "+1 555-0142",
    notes: "Prefers communication over email. Fast payment cycle.",
  });

  const client2 = await Client.create({
    name: "David Chen",
    email: "d.chen@novatech.co",
    company: "Nova Technologies",
    phone: "+1 555-0188",
    notes: "Requires bi-weekly milestone reports.",
  });

  const client3 = await Client.create({
    name: "Elena Rostova",
    email: "elena@artisanroasters.com",
    company: "Artisan Coffee Roasters",
    phone: "+1 555-0199",
    notes: "Brand refresh and full e-commerce revamp.",
  });

  console.log("📁 Inserting sample projects...");
  const project1 = await Project.create({
    title: "Brand Identity & Design System",
    description: "Full corporate identity package including typography, color system, and UI kit.",
    clientId: client1._id,
    budget: 3500,
    startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    status: "In Progress",
    priority: "High",
  });

  const project2 = await Project.create({
    title: "Next.js SaaS Dashboard Frontend",
    description: "Responsive dashboard interface built with Next.js App Router and reusable components.",
    clientId: client2._id,
    budget: 5200,
    startDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    status: "In Progress",
    priority: "High",
  });

  const project3 = await Project.create({
    title: "E-Commerce Storefront Redesign",
    description: "Complete checkout flow optimization and mobile-first product catalog.",
    clientId: client3._id,
    budget: 4000,
    startDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
    deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    status: "Completed",
    priority: "Medium",
  });

  const project4 = await Project.create({
    title: "Mobile App MVP Prototyping",
    description: "Interactive Figma prototype and user testing for mobile onboarding.",
    clientId: client1._id,
    budget: 2200,
    startDate: new Date(),
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    status: "Planning",
    priority: "Low",
  });

  console.log("✓ Inserting sample tasks...");
  // Project 1 Tasks
  await Task.create([
    {
      title: "Moodboard & Color Palette Exploration",
      description: "Present 3 distinct visual directions to client.",
      projectId: project1._id,
      status: "Completed",
      priority: "Medium",
      dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Logo Symbol & Typography Guidelines",
      description: "Vector assets in SVG and primary font licensing.",
      projectId: project1._id,
      status: "Completed",
      priority: "High",
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      title: "UI Component Library Documentation",
      description: "Tokens, spacing scale, and button component specs.",
      projectId: project1._id,
      status: "In Progress",
      priority: "High",
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Client Sign-off & Asset Export",
      description: "Package brand guidelines into PDF booklet.",
      projectId: project1._id,
      status: "To Do",
      priority: "Medium",
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    },
  ]);

  // Project 2 Tasks
  await Task.create([
    {
      title: "Setup Next.js Project Structure",
      description: "Initialize App Router, folder structure, and styles.",
      projectId: project2._id,
      status: "Completed",
      priority: "Medium",
      dueDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Implement API Route Handlers",
      description: "Create REST endpoints for CRUD database operations.",
      projectId: project2._id,
      status: "Completed",
      priority: "High",
      dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Integrate Responsive Dashboard UI",
      description: "Connect data visual cards and filterable tables.",
      projectId: project2._id,
      status: "In Progress",
      priority: "High",
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
  ]);

  // Project 3 Tasks (Completed)
  await Task.create([
    {
      title: "Product Catalog Layout",
      description: "Responsive grid with lazy loading images.",
      projectId: project3._id,
      status: "Completed",
      priority: "Medium",
      dueDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Stripe Checkout Integration",
      description: "Secure one-click payment checkout flow.",
      projectId: project3._id,
      status: "Completed",
      priority: "High",
      dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    },
  ]);

  console.log("💳 Inserting sample payments...");
  await Payment.create([
    {
      projectId: project1._id,
      amount: 1500,
      paymentDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      paymentMethod: "Bank Transfer",
      status: "Completed",
      notes: "Initial 50% deposit for Brand Identity milestone.",
    },
    {
      projectId: project2._id,
      amount: 2600,
      paymentDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
      paymentMethod: "UPI",
      status: "Completed",
      notes: "Milestone 1 frontend setup completion.",
    },
    {
      projectId: project2._id,
      amount: 1300,
      paymentDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      paymentMethod: "Bank Transfer",
      status: "Pending",
      notes: "Milestone 2 pending clearance.",
    },
    {
      projectId: project3._id,
      amount: 4000,
      paymentDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      paymentMethod: "Bank Transfer",
      status: "Completed",
      notes: "Final payout upon project delivery.",
    },
  ]);

  console.log("✅ Seed completed successfully!");
  console.log("   - 3 Clients created");
  console.log("   - 4 Projects created (various statuses & budgets)");
  console.log("   - 9 Tasks created with computed progress");
  console.log("   - 4 Payments created with received & pending totals");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed error:", err);
  process.exit(1);
});

