import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Project title is required"],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: "",
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
    required: [true, "Associated client is required"],
  },
  budget: {
    type: Number,
    required: [true, "Project budget is required"],
    min: [0, "Budget cannot be negative"],
    default: 0,
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  deadline: {
    type: Date,
    required: [true, "Project deadline is required"],
  },
  status: {
    type: String,
    enum: ["Planning", "In Progress", "On Hold", "Completed", "Cancelled"],
    default: "Planning",
  },
  priority: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Medium",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Project || mongoose.model("Project", ProjectSchema);

