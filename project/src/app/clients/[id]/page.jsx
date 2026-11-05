"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import LoadingSpinner from "@/components/LoadingSpinner";
import Modal from "@/components/Modal";

export default function ClientDetailPage({ params }) {
  // In Next.js 15/16 App router, unwrap params with React.use()
  const resolvedParams = use(params);
  const clientId = resolvedParams.id;
  const router = useRouter();

  const [client, setClient] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    notes: "",
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchClientDetails = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`/api/clients/${clientId}`);
      const data = await res.json();
      if (data.success) {
        setClient(data.data.client);
        setProjects(data.data.projects || []);
        setFormData({
          name: data.data.client.name || "",
          email: data.data.client.email || "",
          company: data.data.client.company || "",
          phone: data.data.client.phone || "",
          notes: data.data.client.notes || "",
        });
      } else {
        setError(data.message || "Failed to load client details");
      }
    } catch (err) {
      setError("Network error loading client.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clientId) {
      fetchClientDetails();
    }
  }, [clientId]);

  const handleDeleteClient = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${client?.name}?\nAll associated projects, tasks, and payments will be permanently removed.`
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/clients/${clientId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        router.push("/clients");
      } else {
        alert(data.message || "Failed to delete client");
      }
    } catch (err) {
      alert("Error deleting client");
    }
  };

  const handleUpdateClient = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      setFormError("Name and email are required fields.");
      return;
    }

    try {
      setFormSubmitting(true);
      setFormError("");
      const res = await fetch(`/api/clients/${clientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setClient(data.data);
        setIsEditModalOpen(false);
      } else {
        setFormError(data.message || "Failed to update client");
      }
    } catch (err) {
      setFormError("Network error updating client.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const totalBudget = projects.reduce((acc, p) => acc + (p.budget || 0), 0);

  return (
    <>
      <Header
        title={client ? client.name : "Client Details"}
        subtitle={client?.company ? `Company: ${client.company}` : "Client Profile & Associated Work"}
        actionLabel="✏️ Edit Client"
        onActionClick={() => setIsEditModalOpen(true)}
      />

      <main style={{ padding: "24px", maxWidth: "1200px", width: "100%", margin: "0 auto" }}>
        {/* Back Link */}
        <div style={{ marginBottom: "20px" }}>
          <Link
            href="/clients"
            style={{
              color: "var(--brand-primary)",
              textDecoration: "none",
              fontSize: "0.875rem",
              fontWeight: 500,
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            &larr; Back to all clients
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading client profile..." />
        ) : error || !client ? (
          <EmptyState
            icon="⚠️"
            title="Client Not Found"
            description={error || "The requested client does not exist or was deleted."}
            actionText="Go to Clients List"
            onAction={() => router.push("/clients")}
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Client Profile Card */}
            <div
              style={{
                backgroundColor: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "14px",
                padding: "24px",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "20px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
              }}
            >
              <div>
                <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-light)", textTransform: "uppercase" }}>
                  Contact Information
                </span>
                <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--text-main)" }}>{client.name}</div>
                  <div style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>✉️ {client.email}</div>
                  {client.phone && (
                    <div style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>📞 {client.phone}</div>
                  )}
                  {client.company && (
                    <div style={{ fontSize: "0.875rem", color: "var(--brand-primary)", fontWeight: 500 }}>
                      🏢 {client.company}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-light)", textTransform: "uppercase" }}>
                  Work Statistics
                </span>
                <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
                    Total Projects: <strong style={{ color: "var(--text-main)" }}>{projects.length}</strong>
                  </div>
                  <div style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
                    Total Project Budgets:{" "}
                    <strong style={{ color: "var(--brand-primary)" }}>${totalBudget.toLocaleString()}</strong>
                  </div>
                  <div style={{ fontSize: "0.875rem", color: "var(--text-light)" }}>
                    Client since {new Date(client.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div>
                <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-light)", textTransform: "uppercase" }}>
                  Notes & Preferences
                </span>
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--text-muted)",
                    margin: "8px 0 0 0",
                    fontStyle: client.notes ? "normal" : "italic",
                    backgroundColor: "var(--bg-subtle)",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    lineHeight: 1.5,
                  }}
                >
                  {client.notes || "No additional notes recorded for this client."}
                </p>
                <div style={{ marginTop: "12px", textAlign: "right" }}>
                  <button
                    onClick={handleDeleteClient}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--status-red-text)",
                      fontSize: "0.8125rem",
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                  >
                    Delete this client
                  </button>
                </div>
              </div>
            </div>

            {/* Associated Projects Section */}
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, color: "var(--text-main)" }}>
                    Associated Projects ({projects.length})
                  </h2>
                  <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", margin: "2px 0 0 0" }}>
                    Projects commissioned by {client.name}
                  </p>
                </div>

                <Link
                  href={`/projects?new=true&clientId=${client._id}`}
                  style={{
                    backgroundColor: "var(--brand-primary)",
                    color: "#ffffff",
                    borderRadius: "8px",
                    padding: "8px 14px",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  + Create Project
                </Link>
              </div>

              {projects.length === 0 ? (
                <EmptyState
                  icon="📁"
                  title="No projects for this client yet"
                  description="Start by creating a new project assigned to this client."
                  actionText="+ Create Project"
                  onAction={() => router.push(`/projects?new=true&clientId=${client._id}`)}
                />
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                    gap: "16px",
                  }}
                >
                  {projects.map((project) => (
                    <div
                      key={project._id}
                      style={{
                        backgroundColor: "var(--bg-surface)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "12px",
                        padding: "18px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
                          <Link
                            href={`/projects/${project._id}`}
                            style={{
                              textDecoration: "none",
                              fontWeight: 600,
                              fontSize: "1.0625rem",
                              color: "var(--text-main)",
                            }}
                          >
                            {project.title}
                          </Link>
                          <StatusBadge status={project.status} />
                        </div>

                        {project.description && (
                          <p
                            style={{
                              fontSize: "0.8125rem",
                              color: "var(--text-muted)",
                              margin: "8px 0 0 0",
                              lineHeight: 1.4,
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {project.description}
                          </p>
                        )}
                      </div>

                      <div
                        style={{
                          marginTop: "16px",
                          paddingTop: "12px",
                          borderTop: "1px solid var(--border-subtle)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          fontSize: "0.8125rem",
                        }}
                      >
                        <div>
                          <span style={{ color: "var(--text-light)" }}>Budget: </span>
                          <strong style={{ color: "var(--text-main)" }}>${(project.budget || 0).toLocaleString()}</strong>
                        </div>
                        <Link
                          href={`/projects/${project._id}`}
                          style={{
                            color: "var(--brand-primary)",
                            fontWeight: 600,
                            textDecoration: "none",
                          }}
                        >
                          View Project &rarr;
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Edit Modal */}
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Client Information">
          <form onSubmit={handleUpdateClient} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
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
                Client Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                  Company Name
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
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
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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

            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "6px" }}>
                Notes / Requirements
              </label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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

