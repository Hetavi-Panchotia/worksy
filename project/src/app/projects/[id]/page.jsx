"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import StatusBadge from "@/components/StatusBadge";
import StatCard from "@/components/StatCard";
import Modal from "@/components/Modal";
import EmptyState from "@/components/EmptyState";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function ProjectDetailPage({ params }) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;
  const router = useRouter();

  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Tabs for detail view
  const [activeTab, setActiveTab] = useState("tasks"); // 'tasks' | 'payments'

  // Task Modal state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskFormData, setTaskFormData] = useState({
    title: "",
    description: "",
    status: "To Do",
    priority: "Medium",
    dueDate: "",
  });
  const [taskSubmitting, setTaskSubmitting] = useState(false);

  // Payment Modal state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentFormData, setPaymentFormData] = useState({
    amount: "",
    paymentDate: new Date().toISOString().split("T")[0],
    paymentMethod: "Bank Transfer",
    status: "Completed",
    notes: "",
  });
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);

  // Edit Project Modal state
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
  const [projectForm, setProjectForm] = useState({
    title: "",
    description: "",
    budget: "",
    deadline: "",
    status: "Planning",
    priority: "Medium",
  });
  const [editProjectSubmitting, setEditProjectSubmitting] = useState(false);

  const fetchProject = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`/api/projects/${projectId}`);
      const data = await res.json();
      if (data.success) {
        setProjectData(data.data);
        const p = data.data.project;
        setProjectForm({
          title: p.title || "",
          description: p.description || "",
          budget: p.budget || 0,
          deadline: p.deadline ? new Date(p.deadline).toISOString().split("T")[0] : "",
          status: p.status || "Planning",
          priority: p.priority || "Medium",
        });
      } else {
        setError(data.message || "Failed to load project details");
      }
    } catch (err) {
      setError("Network error loading project.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  // Task Actions
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskFormData.title.trim()) return;

    try {
      setTaskSubmitting(true);
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...taskFormData,
          projectId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsTaskModalOpen(false);
        setTaskFormData({
          title: "",
          description: "",
          status: "To Do",
          priority: "Medium",
          dueDate: "",
        });
        fetchProject();
      } else {
        alert(data.message || "Failed to add task");
      }
    } catch (err) {
      alert("Error adding task");
    } finally {
      setTaskSubmitting(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        // Refresh project data to recompute progress percentage live
        fetchProject();
      }
    } catch (err) {
      console.error("Error updating task status:", err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchProject();
      }
    } catch (err) {
      alert("Error deleting task");
    }
  };

  // Payment Actions
  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!paymentFormData.amount || Number(paymentFormData.amount) <= 0) {
      alert("Please enter a valid payment amount");
      return;
    }

    try {
      setPaymentSubmitting(true);
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...paymentFormData,
          projectId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsPaymentModalOpen(false);
        setPaymentFormData({
          amount: "",
          paymentDate: new Date().toISOString().split("T")[0],
          paymentMethod: "Bank Transfer",
          status: "Completed",
          notes: "",
        });
        fetchProject();
      } else {
        alert(data.message || "Failed to record payment");
      }
    } catch (err) {
      alert("Error recording payment");
    } finally {
      setPaymentSubmitting(false);
    }
  };

  const handleDeletePayment = async (paymentId) => {
    if (!window.confirm("Are you sure you want to delete this payment record?")) return;
    try {
      const res = await fetch(`/api/payments/${paymentId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchProject();
      }
    } catch (err) {
      alert("Error deleting payment");
    }
  };

  // Project Actions
  const handleUpdateProject = async (e) => {
    e.preventDefault();
    try {
      setEditProjectSubmitting(true);
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectForm),
      });
      const data = await res.json();
      if (data.success) {
        setIsEditProjectModalOpen(false);
        fetchProject();
      } else {
        alert(data.message || "Failed to update project");
      }
    } catch (err) {
      alert("Error updating project");
    } finally {
      setEditProjectSubmitting(false);
    }
  };

  const handleDeleteProject = async () => {
    if (
      !window.confirm(
        `Are you sure you want to delete project "${projectData?.project?.title}"?\nAll associated tasks and payments will be removed.`
      )
    )
      return;

    try {
      const res = await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        router.push("/projects");
      } else {
        alert(data.message || "Failed to delete project");
      }
    } catch (err) {
      alert("Error deleting project");
    }
  };

  if (loading) {
    return (
      <main style={{ padding: "40px" }}>
        <LoadingSpinner text="Loading project details..." />
      </main>
    );
  }

  if (error || !projectData) {
    return (
      <main style={{ padding: "24px" }}>
        <EmptyState
          icon="⚠️"
          title="Project Not Found"
          description={error || "The requested project could not be found."}
          actionText="Back to Projects"
          onAction={() => router.push("/projects")}
        />
      </main>
    );
  }

  const { project, tasks, payments, stats } = projectData;
  const isOverdue =
    new Date(project.deadline) < new Date() &&
    project.status !== "Completed" &&
    project.status !== "Cancelled";

  return (
    <>
      <Header
        title={project.title}
        subtitle={`Client: ${project.clientId?.name || "Client"} • Created ${new Date(
          project.createdAt
        ).toLocaleDateString()}`}
        actionLabel="✏️ Edit Project"
        onActionClick={() => setIsEditProjectModalOpen(true)}
      />

      <main style={{ padding: "24px", maxWidth: "1200px", width: "100%", margin: "0 auto" }}>
        {/* Navigation Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <Link
            href="/projects"
            style={{
              color: "var(--brand-primary)",
              textDecoration: "none",
              fontSize: "0.875rem",
              fontWeight: 500,
            }}
          >
            &larr; Back to all projects
          </Link>

          <button
            onClick={handleDeleteProject}
            style={{
              background: "none",
              border: "none",
              color: "var(--status-red-text)",
              fontSize: "0.8125rem",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            🗑️ Delete Project
          </button>
        </div>

        {/* Top Badges & Overdue Alert */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
          <StatusBadge status={project.status} />
          <StatusBadge status={project.priority} type="priority" />
          {isOverdue && (
            <span
              style={{
                backgroundColor: "var(--status-red-bg)",
                color: "var(--status-red-text)",
                border: "1px solid var(--status-red-border)",
                padding: "3px 10px",
                borderRadius: "9999px",
                fontSize: "0.75rem",
                fontWeight: 700,
              }}
            >
              ⚠️ OVERDUE DEADLINE
            </span>
          )}
        </div>

        {/* 4 Stat Overview Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <StatCard
            title="Total Budget"
            value={`$${(project.budget || 0).toLocaleString()}`}
            subtitle="Agreed project pricing"
            icon="💵"
          />
          <StatCard
            title="Total Received"
            value={`$${stats.totalPaid.toLocaleString()}`}
            subtitle="From completed payments"
            icon="✅"
            highlight={stats.totalPaid > 0}
          />
          <StatCard
            title="Outstanding Balance"
            value={`$${stats.outstanding.toLocaleString()}`}
            subtitle={stats.outstanding === 0 ? "Fully paid!" : "Pending collection"}
            icon="⏳"
          />
          <StatCard
            title="Task Progress"
            value={`${stats.progress}%`}
            subtitle={`${stats.completedTasks} of ${stats.totalTasks} completed`}
            icon="🎯"
          />
        </div>

        {/* Project Description & Client Details Card */}
        <div
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "14px",
            padding: "20px 24px",
            marginBottom: "24px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "24px",
          }}
        >
          <div>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-light)" }}>
              Description & Scope
            </span>
            <p style={{ fontSize: "0.9375rem", color: "var(--text-main)", lineHeight: 1.5, marginTop: "8px" }}>
              {project.description || "No project description provided."}
            </p>
            <div style={{ marginTop: "16px", display: "flex", gap: "20px", fontSize: "0.8125rem", color: "var(--text-muted)" }}>
              <div>
                <span>Start: </span>
                <strong style={{ color: "var(--text-main)" }}>
                  {project.startDate ? new Date(project.startDate).toLocaleDateString() : "Not specified"}
                </strong>
              </div>
              <div>
                <span>Deadline: </span>
                <strong style={{ color: isOverdue ? "var(--status-red-text)" : "var(--text-main)" }}>
                  {new Date(project.deadline).toLocaleDateString()}
                </strong>
              </div>
            </div>
          </div>

          <div style={{ borderLeft: "1px solid var(--border-subtle)", paddingLeft: "24px" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-light)" }}>
              Client Information
            </span>
            {project.clientId ? (
              <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "4px" }}>
                <Link
                  href={`/clients/${project.clientId._id}`}
                  style={{
                    fontSize: "1.0625rem",
                    fontWeight: 600,
                    color: "var(--brand-primary)",
                    textDecoration: "none",
                  }}
                >
                  {project.clientId.name} &rarr;
                </Link>
                {project.clientId.company && (
                  <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                    🏢 {project.clientId.company}
                  </div>
                )}
                <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                  ✉️ {project.clientId.email}
                </div>
                {project.clientId.phone && (
                  <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                    📞 {project.clientId.phone}
                  </div>
                )}
              </div>
            ) : (
              <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginTop: "8px" }}>
                No client associated.
              </p>
            )}
          </div>
        </div>

        {/* Section Navigation Tabs: Tasks vs Payments */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid var(--border-subtle)",
            marginBottom: "20px",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", gap: "16px" }}>
            <button
              onClick={() => setActiveTab("tasks")}
              style={{
                background: "none",
                border: "none",
                borderBottom: `2px solid ${activeTab === "tasks" ? "var(--brand-primary)" : "transparent"}`,
                padding: "10px 4px",
                fontSize: "1rem",
                fontWeight: activeTab === "tasks" ? 700 : 500,
                color: activeTab === "tasks" ? "var(--brand-primary)" : "var(--text-muted)",
                cursor: "pointer",
              }}
            >
              Tasks & Deliverables ({tasks.length})
            </button>
            <button
              onClick={() => setActiveTab("payments")}
              style={{
                background: "none",
                border: "none",
                borderBottom: `2px solid ${activeTab === "payments" ? "var(--brand-primary)" : "transparent"}`,
                padding: "10px 4px",
                fontSize: "1rem",
                fontWeight: activeTab === "payments" ? 700 : 500,
                color: activeTab === "payments" ? "var(--brand-primary)" : "var(--text-muted)",
                cursor: "pointer",
              }}
            >
              Payment Records ({payments.length})
            </button>
          </div>

          <div>
            {activeTab === "tasks" ? (
              <button
                onClick={() => setIsTaskModalOpen(true)}
                style={{
                  backgroundColor: "var(--brand-primary)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                + Add Task
              </button>
            ) : (
              <button
                onClick={() => setIsPaymentModalOpen(true)}
                style={{
                  backgroundColor: "var(--brand-primary)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                + Record Payment
              </button>
            )}
          </div>
        </div>

        {/* Tab 1: Tasks Content */}
        {activeTab === "tasks" && (
          <div>
            {tasks.length === 0 ? (
              <EmptyState
                icon="✓"
                title="No tasks added yet"
                description="Break this project into clear actionable deliverables and milestones."
                actionText="+ Add First Task"
                onAction={() => setIsTaskModalOpen(true)}
              />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {tasks.map((task) => {
                  const isDone = task.status === "Completed";
                  return (
                    <div
                      key={task._id}
                      style={{
                        backgroundColor: "var(--bg-surface)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "10px",
                        padding: "14px 18px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "14px",
                        transition: "background-color 0.15s ease",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
                        <input
                          type="checkbox"
                          checked={isDone}
                          onChange={(e) =>
                            handleUpdateTaskStatus(task._id, e.target.checked ? "Completed" : "In Progress")
                          }
                          style={{
                            width: "18px",
                            height: "18px",
                            cursor: "pointer",
                            accentColor: "var(--brand-primary)",
                          }}
                        />
                        <div>
                          <div
                            style={{
                              fontSize: "0.9375rem",
                              fontWeight: 600,
                              color: isDone ? "var(--text-light)" : "var(--text-main)",
                              textDecoration: isDone ? "line-through" : "none",
                            }}
                          >
                            {task.title}
                          </div>
                          {task.description && (
                            <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginTop: "2px" }}>
                              {task.description}
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <StatusBadge status={task.status} />
                        <StatusBadge status={task.priority} type="priority" />
                        {task.dueDate && (
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                            Due {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                        <button
                          onClick={() => handleDeleteTask(task._id)}
                          title="Delete task"
                          style={{
                            background: "none",
                            border: "none",
                            color: "var(--text-light)",
                            cursor: "pointer",
                            padding: "4px",
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Payments Content */}
        {activeTab === "payments" && (
          <div>
            {payments.length === 0 ? (
              <EmptyState
                icon="💳"
                title="No payments recorded yet"
                description="Keep track of client invoices, advances, milestone payouts, and bank transfers."
                actionText="+ Record First Payment"
                onAction={() => setIsPaymentModalOpen(true)}
              />
            ) : (
              <div
                style={{
                  backgroundColor: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "12px",
                  overflow: "hidden",
                }}
              >
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.875rem" }}>
                  <thead>
                    <tr style={{ backgroundColor: "var(--bg-page)", borderBottom: "1px solid var(--border-subtle)" }}>
                      <th style={{ padding: "12px 16px", color: "var(--text-muted)", fontWeight: 600 }}>Amount</th>
                      <th style={{ padding: "12px 16px", color: "var(--text-muted)", fontWeight: 600 }}>Date</th>
                      <th style={{ padding: "12px 16px", color: "var(--text-muted)", fontWeight: 600 }}>Method</th>
                      <th style={{ padding: "12px 16px", color: "var(--text-muted)", fontWeight: 600 }}>Status</th>
                      <th style={{ padding: "12px 16px", color: "var(--text-muted)", fontWeight: 600 }}>Notes</th>
                      <th style={{ padding: "12px 16px", color: "var(--text-muted)", fontWeight: 600, textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p._id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                        <td style={{ padding: "14px 16px", fontWeight: 700, color: "var(--text-main)" }}>
                          ${(p.amount || 0).toLocaleString()}
                        </td>
                        <td style={{ padding: "14px 16px", color: "var(--text-muted)" }}>
                          {new Date(p.paymentDate).toLocaleDateString()}
                        </td>
                        <td style={{ padding: "14px 16px", color: "var(--text-muted)" }}>{p.paymentMethod}</td>
                        <td style={{ padding: "14px 16px" }}>
                          <StatusBadge status={p.status} />
                        </td>
                        <td style={{ padding: "14px 16px", color: "var(--text-muted)", fontStyle: p.notes ? "normal" : "italic" }}>
                          {p.notes || "None"}
                        </td>
                        <td style={{ padding: "14px 16px", textAlign: "right" }}>
                          <button
                            onClick={() => handleDeletePayment(p._id)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "var(--status-red-text)",
                              cursor: "pointer",
                              fontSize: "0.8125rem",
                            }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Add Task Modal */}
        <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title="Add Task to Project">
          <form onSubmit={handleCreateTask} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "6px" }}>
                Task Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Design wireframes for homepage"
                value={taskFormData.title}
                onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid var(--border-subtle)",
                  backgroundColor: "var(--bg-page)",
                }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "6px" }}>
                  Status
                </label>
                <select
                  value={taskFormData.status}
                  onChange={(e) => setTaskFormData({ ...taskFormData, status: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--border-subtle)",
                    backgroundColor: "var(--bg-page)",
                  }}
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "6px" }}>
                  Priority
                </label>
                <select
                  value={taskFormData.priority}
                  onChange={(e) => setTaskFormData({ ...taskFormData, priority: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--border-subtle)",
                    backgroundColor: "var(--bg-page)",
                  }}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "6px" }}>
                Due Date
              </label>
              <input
                type="date"
                value={taskFormData.dueDate}
                onChange={(e) => setTaskFormData({ ...taskFormData, dueDate: e.target.value })}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid var(--border-subtle)",
                  backgroundColor: "var(--bg-page)",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "6px" }}>
                Description
              </label>
              <textarea
                rows={3}
                placeholder="Specific instructions or requirements..."
                value={taskFormData.description}
                onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid var(--border-subtle)",
                  backgroundColor: "var(--bg-page)",
                  resize: "vertical",
                }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
              <button
                type="button"
                onClick={() => setIsTaskModalOpen(false)}
                style={{
                  padding: "8px 14px",
                  borderRadius: "6px",
                  border: "1px solid var(--border-subtle)",
                  backgroundColor: "var(--bg-surface)",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={taskSubmitting}
                style={{
                  padding: "8px 18px",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: "var(--brand-primary)",
                  color: "#ffffff",
                  fontWeight: 600,
                  cursor: taskSubmitting ? "not-allowed" : "pointer",
                }}
              >
                {taskSubmitting ? "Adding..." : "Add Task"}
              </button>
            </div>
          </form>
        </Modal>

        {/* Record Payment Modal */}
        <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title="Record Payment for Project">
          <form onSubmit={handleRecordPayment} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "6px" }}>
                  Amount ($) *
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  placeholder="500.00"
                  value={paymentFormData.amount}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, amount: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--border-subtle)",
                    backgroundColor: "var(--bg-page)",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "6px" }}>
                  Payment Date *
                </label>
                <input
                  type="date"
                  required
                  value={paymentFormData.paymentDate}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, paymentDate: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--border-subtle)",
                    backgroundColor: "var(--bg-page)",
                  }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "6px" }}>
                  Payment Method
                </label>
                <select
                  value={paymentFormData.paymentMethod}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, paymentMethod: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--border-subtle)",
                    backgroundColor: "var(--bg-page)",
                  }}
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="UPI">UPI</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "6px" }}>
                  Payment Status
                </label>
                <select
                  value={paymentFormData.status}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, status: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--border-subtle)",
                    backgroundColor: "var(--bg-page)",
                  }}
                >
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "6px" }}>
                Notes / Reference ID
              </label>
              <input
                type="text"
                placeholder="e.g. Transaction ID, Milestone 1 Advance"
                value={paymentFormData.notes}
                onChange={(e) => setPaymentFormData({ ...paymentFormData, notes: e.target.value })}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid var(--border-subtle)",
                  backgroundColor: "var(--bg-page)",
                }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                style={{
                  padding: "8px 14px",
                  borderRadius: "6px",
                  border: "1px solid var(--border-subtle)",
                  backgroundColor: "var(--bg-surface)",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={paymentSubmitting}
                style={{
                  padding: "8px 18px",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: "var(--brand-primary)",
                  color: "#ffffff",
                  fontWeight: 600,
                  cursor: paymentSubmitting ? "not-allowed" : "pointer",
                }}
              >
                {paymentSubmitting ? "Recording..." : "Save Payment"}
              </button>
            </div>
          </form>
        </Modal>

        {/* Edit Project Modal */}
        <Modal isOpen={isEditProjectModalOpen} onClose={() => setIsEditProjectModalOpen(false)} title="Edit Project">
          <form onSubmit={handleUpdateProject} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "6px" }}>
                Title *
              </label>
              <input
                type="text"
                required
                value={projectForm.title}
                onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid var(--border-subtle)",
                  backgroundColor: "var(--bg-page)",
                }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "6px" }}>
                  Budget ($) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={projectForm.budget}
                  onChange={(e) => setProjectForm({ ...projectForm, budget: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--border-subtle)",
                    backgroundColor: "var(--bg-page)",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "6px" }}>
                  Deadline *
                </label>
                <input
                  type="date"
                  required
                  value={projectForm.deadline}
                  onChange={(e) => setProjectForm({ ...projectForm, deadline: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--border-subtle)",
                    backgroundColor: "var(--bg-page)",
                  }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "6px" }}>
                  Status
                </label>
                <select
                  value={projectForm.status}
                  onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--border-subtle)",
                    backgroundColor: "var(--bg-page)",
                  }}
                >
                  <option value="Planning">Planning</option>
                  <option value="In Progress">In Progress</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "6px" }}>
                  Priority
                </label>
                <select
                  value={projectForm.priority}
                  onChange={(e) => setProjectForm({ ...projectForm, priority: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--border-subtle)",
                    backgroundColor: "var(--bg-page)",
                  }}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "6px" }}>
                Description
              </label>
              <textarea
                rows={3}
                value={projectForm.description}
                onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid var(--border-subtle)",
                  backgroundColor: "var(--bg-page)",
                  resize: "vertical",
                }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
              <button
                type="button"
                onClick={() => setIsEditProjectModalOpen(false)}
                style={{
                  padding: "8px 14px",
                  borderRadius: "6px",
                  border: "1px solid var(--border-subtle)",
                  backgroundColor: "var(--bg-surface)",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={editProjectSubmitting}
                style={{
                  padding: "8px 18px",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: "var(--brand-primary)",
                  color: "#ffffff",
                  fontWeight: 600,
                  cursor: editProjectSubmitting ? "not-allowed" : "pointer",
                }}
              >
                {editProjectSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </Modal>
      </main>
    </>
  );
}

