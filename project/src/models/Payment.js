import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: [true, "Associated project is required"],
  },
  amount: {
    type: Number,
    required: [true, "Payment amount is required"],
    min: [0, "Amount cannot be negative"],
  },
  paymentDate: {
    type: Date,
    default: Date.now,
  },
  paymentMethod: {
    type: String,
    enum: ["Cash", "Bank Transfer", "UPI", "Other"],
    default: "Bank Transfer",
  },
  status: {
    type: String,
    enum: ["Completed", "Pending", "Failed"],
    default: "Completed",
  },
  notes: {
    type: String,
    trim: true,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);

