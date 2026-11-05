"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import StatusBadge from "@/components/StatusBadge";
import StatCard from "@/components/StatCard";
import Modal from "@/components/Modal";
import EmptyState from "@/components/EmptyState";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({ totalReceived: 0, totalPending: 0, completedCount: 0 });
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [error, setError] = useState("");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    projectId: "",
    amount: "",
    paymentDate: new Date().toISOString().split("T")[0],
    paymentMethod: "Bank Transfer",
    status: "Completed",
    notes: "",
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const statusTabs = ["All", "Completed", "Pending", "Failed"];

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

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError("");
      const url =
        statusFilter !== "All"
          ? `/api/payments?status=${encodeURIComponent(statusFilter)}`
          : "/api/payments";
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setPayments(data.data);
        if (data.summary) {
          setSummary(data.summary);
        }
      } else {
        setError(data.message || "Failed to load payments");
      }
    } catch (err) {
      setError("Network error loading payments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [statusFilter]);

  const handleOpenAddModal = () => {
    setFormData({
      projectId: projects.length > 0 ? projects[0]._id : "",
      amount: "",
      paymentDate: new Date().toISOString().split("T")[0],
      paymentMethod: "Bank Transfer",
      status: "Completed",
      notes: "",
    });
    setFormError("");
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (payment) => {
    setEditingPayment(payment);
    setFormData({
      projectId: payment.projectId?._id || payment.projectId || "",
      amount: payment.amount || "",
      paymentDate: payment.paymentDate ? new Date(payment.paymentDate).toISOString().split("T")[0] : "",
      paymentMethod: payment.paymentMethod || "Bank Transfer",
      status: payment.status || "Completed",
      notes: payment.notes || "",
    });
    setFormError("");
    setIsEditModalOpen(true);
  };

  const handleDeletePayment = async (id) => {
    if (!window.confirm("Are you sure you want to delete this payment record?")) return;
    try {
      const res = await fetch(`/api/payments/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchPayments();
      } else {
        alert(data.message || "Failed to delete payment");
      }
    } catch (err) {
      alert("Error deleting payment");
    }
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    if (!formData.projectId || !formData.amount || Number(formData.amount) <= 0) {
      setFormError("Project and a positive amount are required.");
      return;
    }

    try {
      setFormSubmitting(true);
      setFormError("");
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setIsAddModalOpen(false);
        fetchPayments();
      } else {
        setFormError(data.message || "Failed to record payment");
      }
    } catch (err) {
      setFormError("Network error occurred.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (!formData.amount || Number(formData.amount) <= 0) {
      setFormError("Valid amount is required.");
      return;
    }

    try {
      setFormSubmitting(true);
      setFormError("");
      const res = await fetch(`/api/payments/${editingPayment._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setIsEditModalOpen(false);
        setEditingPayment(null);
        fetchPayments();
      } else {
        setFormError(data.message || "Failed to update payment");
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
        title="Payment Tracking"
        subtitle="Record earnings, monitor invoices, and manage payment milestones."
        actionLabel="+ Record Payment"
        onActionClick={handleOpenAddModal}
      />

      <main style={{ padding: "24px", maxWidth: "1200px", width: "100%", margin: "0 auto" }}>
        {/* Summary Stat Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <StatCard
            title="Total Revenue Received"
            value={`$${summary.totalReceived.toLocaleString()}`}
            subtitle="From completed transactions"
            icon="💵"
            highlight={true}
          />
          <StatCard
            title="Pending Payments"
            value={`$${summary.totalPending.toLocaleString()}`}
            subtitle="Awaiting clearance or transfer"
            icon="⏳"
          />
          <StatCard
            title="Completed Transactions"
            value={summary.completedCount}
            subtitle="Total verified payouts"
            icon="✓"
          />
        </div>

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
          <LoadingSpinner text="Loading payment records..." />
        ) : payments.length === 0 ? (
          <EmptyState
            icon="💳"
            title={statusFilter !== "All" ? `No "${statusFilter}" payments found` : "No payments recorded yet"}
            description={
              statusFilter !== "All"
                ? "Try selecting a different status filter."
                : "Record client payments, advances, and milestones to monitor revenue."
            }
            actionText={statusFilter !== "All" ? "View All Payments" : "+ Record First Payment"}
            onAction={statusFilter !== "All" ? () => setStatusFilter("All") : handleOpenAddModal}
          />
        ) : (
          <div
            style={{
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "14px",
              overflow: "hidden",
              boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
            }}
          >
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.875rem" }}>
                <thead>
                  <tr style={{ backgroundColor: "var(--bg-page)", borderBottom: "1px solid var(--border-subtle)" }}>
                    <th style={{ padding: "14px 18px", color: "var(--text-muted)", fontWeight: 600 }}>Amount</th>
                    <th style={{ padding: "14px 18px", color: "var(--text-muted)", fontWeight: 600 }}>Project / Client</th>
                    <th style={{ padding: "14px 18px", color: "var(--text-muted)", fontWeight: 600 }}>Date</th>
                    <th style={{ padding: "14px 18px", color: "var(--text-muted)", fontWeight: 600 }}>Method</th>
                    <th style={{ padding: "14px 18px", color: "var(--text-muted)", fontWeight: 600 }}>Status</th>
                    <th style={{ padding: "14px 18px", color: "var(--text-muted)", fontWeight: 600 }}>Notes</th>
                    <th style={{ padding: "14px 18px", color: "var(--text-muted)", fontWeight: 600, textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p._id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                      <td style={{ padding: "16px 18px", fontWeight: 700, fontSize: "1rem", color: "var(--text-main)" }}>
                        ${(p.amount || 0).toLocaleString()}
                      </td>

                      <td style={{ padding: "16px 18px" }}>
                        {p.projectId ? (
                          <div>
                            <Link
                              href={`/projects/${p.projectId._id}`}
                              style={{
                                color: "var(--text-main)",
                                fontWeight: 600,
                                textDecoration: "none",
                              }}
                            >
                              {p.projectId.title}
                            </Link>
                            {p.projectId.clientId && (
                              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                                Client: {p.projectId.clientId.name}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: "var(--text-light)" }}>Unassigned project</span>
                        )}
                      </td>

                      <td style={{ padding: "16px 18px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                        {new Date(p.paymentDate).toLocaleDateString()}
                      </td>

                      <td style={{ padding: "16px 18px", color: "var(--text-main)", fontWeight: 500 }}>
                        {p.paymentMethod}
                      </td>

                      <td style={{ padding: "16px 18px" }}>
                        <StatusBadge status={p.status} />
                      </td>

                      <td style={{ padding: "16px 18px", color: "var(--text-muted)", maxWidth: "200px" }}>
                        {p.notes || <span style={{ color: "var(--text-light)", fontStyle: "italic" }}>None</span>}
                      </td>

                      <td style={{ padding: "16px 18px", textAlign: "right", whiteSpace: "nowrap" }}>
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "var(--brand-primary)",
                            cursor: "pointer",
                            fontSize: "0.8125rem",
                            fontWeight: 600,
                            marginRight: "10px",
                          }}
                        >
                          Edit
                        </button>
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
          </div>
        )}

        {/* Record Payment Modal */}
        <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Record New Payment">
          {projects.length === 0 ? (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "16px" }}>
                You need to create at least one project before recording payments.
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
                    Select a project
                  </option>
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.title} (Budget: ${(p.budget || 0).toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "6px" }}>
                    Payment Amount ($) *
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    placeholder="750.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
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
                    value={formData.paymentDate}
                    onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
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
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
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
                    <option value="Completed">Completed</option>
                    <option value="Pending">Pending</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "6px" }}>
                  Notes / Reference Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. Wire confirmation #4912, Milestone 2 advance"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
                  {formSubmitting ? "Recording..." : "Record Payment"}
                </button>
              </div>
            </form>
          )}
        </Modal>

        {/* Edit Payment Modal */}
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Payment Record">
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
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
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
                  value={formData.paymentDate}
                  onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
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
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
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
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "6px" }}>
                Notes / Reference
              </label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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

