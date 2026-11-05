"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import StatusBadge from "@/components/StatusBadge";
import Modal from "@/components/Modal";
import EmptyState from "@/components/EmptyState";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [error, setError] = useState("");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    projectId: "",
    status: "To Do",
    priority: "Medium",
    dueDate: "",
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const statusTabs = ["All", "To Do", "In Progress", "Completed"];

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      if (data.success) {
        setProjects(data.data);
      }
    } catch (e) {
      console.error("Error loading projects:", e);
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError("");
      const url = statusFilter !== "All" ? `/api/tasks?status=${encodeURIComponent(statusFilter)}` : "/api/tasks";
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setTasks(data.data);
      } else {
        setError(data.message || "Failed to load tasks");
      }
    } catch (err) {
      setError("Network error loading tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [statusFilter]);

  const handleOpenAddModal = () => {
    setFormData({
      title: "",
      description: "",
      projectId: projects.length > 0 ? projects[0]._id : "",
      status: "To Do",
      priority: "Medium",
      dueDate: "",
    });
    setFormError("");
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title || "",
      description: task.description || "",
      projectId: task.projectId?._id || task.projectId || "",
      status: task.status || "To Do",
      priority: task.priority || "Medium",
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
    });
    setFormError("");
    setIsEditModalOpen(true);
  };

  const handleToggleStatus = async (task) => {
    const nextStatus = task.status === "Completed" ? "In Progress" : "Completed";
    try {
      const res = await fetch(`/api/tasks/${task._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setTasks((prev) =>
          prev.map((t) => (t._id === task._id ? { ...t, status: nextStatus } : t))
        );
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const handleDeleteTask = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete task "${title}"?`)) return;
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setTasks((prev) => prev.filter((t) => t._id !== id));
      } else {
        alert(data.message || "Failed to delete task");
      }
    } catch (err) {
      alert("Error deleting task");
    }
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.projectId) {
      setFormError("Task title and associated project are required.");
      return;
    }

    try {
      setFormSubmitting(true);
      setFormError("");
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setIsAddModalOpen(false);
        fetchTasks();
      } else {
        setFormError(data.message || "Failed to create task");
      }
    } catch (err) {
      setFormError("Network error occurred.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setFormError("Task title is required.");
      return;
    }

    try {
      setFormSubmitting(true);
      setFormError("");
      const res = await fetch(`/api/tasks/${editingTask._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setIsEditModalOpen(false);
        setEditingTask(null);
        fetchTasks();
      } else {
        setFormError(data.message || "Failed to update task");
      }
    } catch (err) {
      setFormError("Network error occurred.");
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <>
      <Header
        title="Tasks & Deliverables"
        subtitle="Manage to-dos, priorities, deadlines, and milestones across all your projects."
        actionLabel="+ Add Task"
        onActionClick={handleOpenAddModal}
      />

      <main style={{ padding: "24px", maxWidth: "1200px", width: "100%", margin: "0 auto" }}>
        {/* Status Filter Tabs */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            overflowX: "auto",
            paddingBottom: "12px",
            marginBottom: "20px",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          {statusTabs.map((s) => {
            const active = statusFilter === s;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "20px",
                  border: `1px solid ${active ? "var(--brand-primary)" : "var(--border-subtle)"}`,
                  backgroundColor: active ? "var(--brand-primary)" : "var(--bg-surface)",
                  color: active ? "#ffffff" : "var(--text-main)",
                  fontSize: "0.8125rem",
                  fontWeight: active ? 600 : 500,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {s}
              </button>
            );
          })}
        </div>

        {error && (
          <div
            style={{
              padding: "12px 16px",
              backgroundColor: "var(--status-red-bg)",
              color: "var(--status-red-text)",
              border: "1px solid var(--status-red-border)",
              borderRadius: "8px",
              marginBottom: "16px",
            }}
          >
            {error}
          </div>
        )}

        {loading ? (
          <LoadingSpinner text="Loading tasks..." />
        ) : tasks.length === 0 ? (
          <EmptyState
            icon="✓"
            title={statusFilter !== "All" ? `No "${statusFilter}" tasks found` : "No tasks recorded"}
            description={
              statusFilter !== "All"
                ? "Try selecting a different status filter."
                : "Add action items and milestones to start tracking progress across projects."
            }
            actionText={statusFilter !== "All" ? "View All Tasks" : "+ Add Your First Task"}
            onAction={statusFilter !== "All" ? () => setStatusFilter("All") : handleOpenAddModal}
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {tasks.map((task) => {
              const isDone = task.status === "Completed";
              const isOverdue =
                task.dueDate &&
                new Date(task.dueDate) < new Date() &&
                task.status !== "Completed";

              return (
                <div
                  key={task._id}
                  style={{
                    backgroundColor: "var(--bg-surface)",
                    border: `1px solid ${isOverdue ? "var(--status-red-border)" : "var(--border-subtle)"}`,
                    borderRadius: "12px",
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "16px",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", flex: 1 }}>
                    <input
                      type="checkbox"
                      checked={isDone}
                      onChange={() => handleToggleStatus(task)}
                      title="Click to toggle completion"
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

                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px", flexWrap: "wrap" }}>
                        {task.projectId && (
                          <Link
                            href={`/projects/${task.projectId._id || task.projectId}`}
                            style={{
                              fontSize: "0.75rem",
                              color: "var(--brand-primary)",
                              fontWeight: 600,
                              textDecoration: "none",
                              backgroundColor: "var(--brand-light)",
                              padding: "2px 6px",
                              borderRadius: "4px",
                            }}
                          >
                            📁 {task.projectId.title || "Project"}
                          </Link>
                        )}
                        {task.description && (
                          <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                            • {task.description}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    <StatusBadge status={task.status} />
                    <StatusBadge status={task.priority} type="priority" />

                    {task.dueDate && (
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: isOverdue ? 700 : 500,
                          color: isOverdue ? "var(--status-red-text)" : "var(--text-muted)",
                          backgroundColor: isOverdue ? "var(--status-red-bg)" : "var(--bg-page)",
                          padding: "2px 8px",
                          borderRadius: "4px",
                        }}
                      >
                        {isOverdue ? "Overdue: " : "Due: "}
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}

                    <button
                      onClick={() => handleOpenEditModal(task)}
                      title="Edit task"
                      style={{
                        background: "var(--bg-subtle)",
                        border: "none",
                        borderRadius: "6px",
                        padding: "6px 8px",
                        cursor: "pointer",
                        fontSize: "0.75rem",
                      }}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task._id, task.title)}
                      title="Delete task"
                      style={{
                        background: "var(--status-red-bg)",
                        border: "none",
                        borderRadius: "6px",
                        padding: "6px 8px",
                        cursor: "pointer",
                        fontSize: "0.75rem",
                        color: "var(--status-red-text)",
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add Task Modal */}
        <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Create New Task">
          {projects.length === 0 ? (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "16px" }}>
                You need to create at least one project before adding tasks.
              </p>
              <Link
                href="/projects"
                style={{
                  backgroundColor: "var(--brand-primary)",
                  color: "#ffffff",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                }}
              >
                Go to Projects Page
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmitAdd} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {formError && (
                <div
                  style={{
                    padding: "8px 12px",
                    backgroundColor: "var(--status-red-bg)",
                    color: "var(--status-red-text)",
                    borderRadius: "6px",
                    fontSize: "0.8125rem",
                  }}
                >
                  {formError}
                </div>
              )}

              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "6px" }}>
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement user login API endpoint"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                  Associated Project *
                </label>
                <select
                  required
                  value={formData.projectId}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--border-subtle)",
                    backgroundColor: "var(--bg-page)",
                  }}
                >
                  <option value="" disabled>
                    Select project
                  </option>
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "6px" }}>
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
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
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
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
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
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
                  Description / Sub-tasks
                </label>
                <textarea
                  rows={3}
                  placeholder="Task scope or testing instructions..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                  onClick={() => setIsAddModalOpen(false)}
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
                  disabled={formSubmitting}
                  style={{
                    padding: "8px 18px",
                    borderRadius: "6px",
                    border: "none",
                    backgroundColor: "var(--brand-primary)",
                    color: "#ffffff",
                    fontWeight: 600,
                    cursor: formSubmitting ? "not-allowed" : "pointer",
                  }}
                >
                  {formSubmitting ? "Creating..." : "Create Task"}
                </button>
              </div>
            </form>
          )}
        </Modal>

        {/* Edit Task Modal */}
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Task">
          <form onSubmit={handleSubmitEdit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {formError && (
              <div
                style={{
                  padding: "8px 12px",
                  backgroundColor: "var(--status-red-bg)",
                  color: "var(--status-red-text)",
                  borderRadius: "6px",
                  fontSize: "0.8125rem",
                }}
              >
                {formError}
              </div>
            )}

            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "6px" }}>
                Task Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
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
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
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
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
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
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                onClick={() => setIsEditModalOpen(false)}
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
                disabled={formSubmitting}
                style={{
                  padding: "8px 18px",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: "var(--brand-primary)",
                  color: "#ffffff",
                  fontWeight: 600,
                  cursor: formSubmitting ? "not-allowed" : "pointer",
                }}
              >
                {formSubmitting ? "Updating..." : "Save Changes"}
              </button>
            </div>
          </form>
        </Modal>
      </main>
    </>
  );
}

