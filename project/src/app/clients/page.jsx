"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Modal from "@/components/Modal";
import EmptyState from "@/components/EmptyState";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    notes: "",
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchClients = async (searchTerm = "") => {
    try {
      setLoading(true);
      setError("");
      const url = searchTerm ? `/api/clients?search=${encodeURIComponent(searchTerm)}` : "/api/clients";
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setClients(data.data);
      } else {
        setError(data.message || "Failed to load clients");
      }
    } catch (err) {
      setError("Network error while loading clients.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchClients(search);
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const handleOpenAddModal = () => {
    setFormData({ name: "", email: "", company: "", phone: "", notes: "" });
    setFormError("");
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (client, e) => {
    e.stopPropagation();
    setEditingClient(client);
    setFormData({
      name: client.name || "",
      email: client.email || "",
      company: client.company || "",
      phone: client.phone || "",
      notes: client.notes || "",
    });
    setFormError("");
    setIsEditModalOpen(true);
  };

  const handleDeleteClient = async (id, name, e) => {
    e.stopPropagation();
    const confirmed = window.confirm(
      `Are you sure you want to delete client "${name}"?\nThis will also remove all projects, tasks, and payments associated with this client.`
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setClients((prev) => prev.filter((c) => c._id !== id));
      } else {
        alert(data.message || "Failed to delete client");
      }
    } catch (err) {
      alert("Error deleting client");
    }
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      setFormError("Name and email are required fields.");
      return;
    }

    try {
      setFormSubmitting(true);
      setFormError("");
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setIsAddModalOpen(false);
        fetchClients(search);
      } else {
        setFormError(data.message || "Failed to create client");
      }
    } catch (err) {
      setFormError("Network error occurred.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      setFormError("Name and email are required fields.");
      return;
    }

    try {
      setFormSubmitting(true);
      setFormError("");
      const res = await fetch(`/api/clients/${editingClient._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setIsEditModalOpen(false);
        setEditingClient(null);
        fetchClients(search);
      } else {
        setFormError(data.message || "Failed to update client");
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
        title="Clients"
        subtitle="Manage your client contacts, company info, and assigned projects."
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search clients..."
        actionLabel="+ Add Client"
        onActionClick={handleOpenAddModal}
      />

      <main style={{ padding: "24px", maxWidth: "1200px", width: "100%", margin: "0 auto" }}>
        {error && (
          <div
            style={{
              padding: "12px 16px",
              backgroundColor: "var(--status-red-bg)",
              color: "var(--status-red-text)",
              border: "1px solid var(--status-red-border)",
              borderRadius: "8px",
              marginBottom: "16px",
              fontSize: "0.875rem",
            }}
          >
            {error}
          </div>
        )}

        {loading ? (
          <LoadingSpinner text="Loading clients..." />
        ) : clients.length === 0 ? (
          <EmptyState
            icon="👥"
            title={search ? "No matching clients found" : "No clients yet"}
            description={
              search
                ? "Try searching for a different name, email, or company."
                : "Add your first client to start organizing projects, tasks, and payments."
            }
            actionText={search ? "Clear Search" : "+ Add Your First Client"}
            onAction={search ? () => setSearch("") : handleOpenAddModal}
          />
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "20px",
            }}
          >
            {clients.map((client) => (
              <div
                key={client._id}
                style={{
                  backgroundColor: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "12px",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                  transition: "box-shadow 0.15s ease, border-color 0.15s ease",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px" }}>
                    <div>
                      <Link
                        href={`/clients/${client._id}`}
                        style={{
                          textDecoration: "none",
                          fontSize: "1.125rem",
                          fontWeight: 600,
                          color: "var(--text-main)",
                          lineHeight: 1.3,
                        }}
                      >
                        {client.name}
                      </Link>
                      {client.company && (
                        <div
                          style={{
                            fontSize: "0.8125rem",
                            color: "var(--brand-primary)",
                            fontWeight: 500,
                            marginTop: "2px",
                          }}
                        >
                          🏢 {client.company}
                        </div>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        onClick={(e) => handleOpenEditModal(client, e)}
                        title="Edit client"
                        style={{
                          background: "var(--bg-subtle)",
                          border: "none",
                          borderRadius: "6px",
                          padding: "6px 8px",
                          cursor: "pointer",
                          fontSize: "0.8125rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={(e) => handleDeleteClient(client._id, client.name, e)}
                        title="Delete client"
                        style={{
                          background: "var(--status-red-bg)",
                          border: "none",
                          borderRadius: "6px",
                          padding: "6px 8px",
                          cursor: "pointer",
                          fontSize: "0.8125rem",
                          color: "var(--status-red-text)",
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ fontSize: "0.875rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
                      <span>✉️</span>
                      <a
                        href={`mailto:${client.email}`}
                        style={{ color: "inherit", textDecoration: "none" }}
                      >
                        {client.email}
                      </a>
                    </div>
                    {client.phone && (
                      <div style={{ fontSize: "0.875rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
                        <span>📞</span>
                        <span>{client.phone}</span>
                      </div>
                    )}
                    {client.notes && (
                      <p
                        style={{
                          fontSize: "0.8125rem",
                          color: "var(--text-muted)",
                          marginTop: "8px",
                          lineHeight: 1.4,
                          background: "var(--bg-subtle)",
                          padding: "8px 10px",
                          borderRadius: "6px",
                          fontStyle: "italic",
                        }}
                      >
                        "{client.notes}"
                      </p>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    marginTop: "20px",
                    paddingTop: "14px",
                    borderTop: "1px solid var(--border-subtle)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ fontSize: "0.75rem", color: "var(--text-light)" }}>
                    Added {new Date(client.createdAt).toLocaleDateString()}
                  </span>
                  <Link
                    href={`/clients/${client._id}`}
                    style={{
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      color: "var(--brand-primary)",
                      textDecoration: "none",
                    }}
                  >
                    View Details &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Client Modal */}
        <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Client">
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
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "6px", color: "var(--text-main)" }}>
                Client Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Sarah Jenkins"
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
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "6px", color: "var(--text-main)" }}>
                Email Address *
              </label>
              <input
                type="email"
                required
                placeholder="e.g. sarah@example.com"
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
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "6px", color: "var(--text-main)" }}>
                  Company Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Acme Studio"
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
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "6px", color: "var(--text-main)" }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +1 555-0199"
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
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "6px", color: "var(--text-main)" }}>
                Notes / Requirements
              </label>
              <textarea
                rows={3}
                placeholder="Key client preferences, communication channels, or notes..."
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
                {formSubmitting ? "Saving..." : "Create Client"}
              </button>
            </div>
          </form>
        </Modal>

        {/* Edit Client Modal */}
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Client Information">
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
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "6px", color: "var(--text-main)" }}>
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
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "6px", color: "var(--text-main)" }}>
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
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "6px", color: "var(--text-main)" }}>
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
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "6px", color: "var(--text-main)" }}>
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
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "6px", color: "var(--text-main)" }}>
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

