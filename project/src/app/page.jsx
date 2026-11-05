"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/dashboard");
      const result = await res.json();
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.message || "Failed to load dashboard data");
      }
    } catch (err) {
      setError("Network error connecting to database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <>
      <Header
        title="Dashboard Overview"
        subtitle="Live metrics, deliverables, revenue, and active projects."
      />

      <main style={{ padding: "24px", maxWidth: "1280px", width: "100%", margin: "0 auto" }}>
        {error && (
          <div
            style={{
              padding: "14px 18px",
              backgroundColor: "var(--status-red-bg)",
              color: "var(--status-red-text)",
              border: "1px solid var(--status-red-border)",
              borderRadius: "10px",
              marginBottom: "20px",
              fontSize: "0.875rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span>{error}</span>
            <button
              onClick={fetchDashboard}
              style={{
                background: "none",
                border: "1px solid var(--status-red-border)",
                color: "var(--status-red-text)",
                borderRadius: "4px",
                padding: "4px 8px",
                cursor: "pointer",
                fontSize: "0.75rem",
                fontWeight: 600,
              }}
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <LoadingSpinner text="Computing dashboard metrics from database..." />
        ) : !data ? (
          <EmptyState
            icon="📊"
            title="Unable to load dashboard"
            description="Ensure MongoDB is connected and check your credentials."
            actionText="Try Again"
            onAction={fetchDashboard}
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            {/* Quick Actions Row */}
            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "var(--bg-surface)",
                padding: "14px 18px",
                borderRadius: "12px",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-main)" }}>
                ⚡ Quick Actions:
              </div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <Link
                  href="/clients"
                  style={{
                    backgroundColor: "var(--bg-subtle)",
                    color: "var(--text-main)",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  + Add Client
                </Link>
                <Link
                  href="/projects"
                  style={{
                    backgroundColor: "var(--brand-primary)",
                    color: "#ffffff",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  + New Project
                </Link>
                <Link
                  href="/tasks"
                  style={{
                    backgroundColor: "var(--bg-subtle)",
                    color: "var(--text-main)",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  + New Task
                </Link>
                <Link
                  href="/payments"
                  style={{
                    backgroundColor: "var(--bg-subtle)",
                    color: "var(--text-main)",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  + Record Payment
                </Link>
              </div>
            </div>

            {/* 6 Key Stat Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "16px",
              }}
            >
              <StatCard
                title="Total Clients"
                value={data.metrics.totalClients}
                subtitle="Active client accounts"
                icon="👥"
              />
              <StatCard
                title="Total Projects"
                value={data.metrics.totalProjects}
                subtitle="All project engagements"
                icon="📁"
              />
              <StatCard
                title="Active Projects"
                value={data.metrics.activeProjects}
                subtitle="In planning or progress"
                icon="🚀"
                highlight={data.metrics.activeProjects > 0}
              />
              <StatCard
                title="Completed Projects"
                value={data.metrics.completedProjects}
                subtitle="Delivered to clients"
                icon="✅"
              />
              <StatCard
                title="Payments Received"
                value={`$${data.metrics.totalReceived.toLocaleString()}`}
                subtitle="Completed transactions"
                icon="💵"
                highlight={true}
              />
              <StatCard
                title="Outstanding Due"
                value={`$${data.metrics.totalOutstanding.toLocaleString()}`}
                subtitle="Pending client receivables"
                icon="⏳"
              />
            </div>

            {/* Status Distribution Breakdown */}
            <div
              style={{
                backgroundColor: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "14px",
                padding: "20px 24px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <h2 style={{ fontSize: "1.0625rem", fontWeight: 700, margin: 0, color: "var(--text-main)" }}>
                  Project Status Distribution
                </h2>
                <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                  Total: {data.metrics.totalProjects} projects
                </span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                  gap: "12px",
                }}
              >
                {Object.entries(data.statusDistribution).map(([statusName, count]) => (
                  <div
                    key={statusName}
                    style={{
                      padding: "12px 14px",
                      backgroundColor: "var(--bg-page)",
                      borderRadius: "8px",
                      border: "1px solid var(--border-subtle)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <StatusBadge status={statusName} />
                      <strong style={{ fontSize: "1.125rem", color: "var(--text-main)" }}>{count}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Grid 2 Columns: Recent Projects & Upcoming Deadlines */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
                gap: "24px",
              }}
            >
              {/* Recent Projects */}
              <div
                style={{
                  backgroundColor: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "14px",
                  padding: "20px 24px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "16px",
                  }}
                >
                  <h2 style={{ fontSize: "1.0625rem", fontWeight: 700, margin: 0, color: "var(--text-main)" }}>
                    Recent Projects
                  </h2>
                  <Link
                    href="/projects"
                    style={{ fontSize: "0.8125rem", color: "var(--brand-primary)", fontWeight: 600, textDecoration: "none" }}
                  >
                    View All &rarr;
                  </Link>
                </div>

                {data.recentProjects.length === 0 ? (
                  <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", fontStyle: "italic", margin: "20px 0" }}>
                    No projects found. Create your first project to start tracking.
                  </p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {data.recentProjects.map((p) => (
                      <div
                        key={p._id}
                        style={{
                          padding: "12px 14px",
                          backgroundColor: "var(--bg-page)",
                          borderRadius: "10px",
                          border: "1px solid var(--border-subtle)",
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <Link
                            href={`/projects/${p._id}`}
                            style={{
                              fontSize: "0.9375rem",
                              fontWeight: 600,
                              color: "var(--text-main)",
                              textDecoration: "none",
                            }}
                          >
                            {p.title}
                          </Link>
                          <StatusBadge status={p.status} />
                        </div>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            fontSize: "0.75rem",
                            color: "var(--text-muted)",
                          }}
                        >
                          <span>Client: {p.clientId?.name || "Client"}</span>
                          <span>Progress: {p.progress}%</span>
                        </div>

                        {/* Mini progress bar */}
                        <div
                          style={{
                            height: "4px",
                            backgroundColor: "var(--border-subtle)",
                            borderRadius: "9999px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${p.progress}%`,
                              height: "100%",
                              backgroundColor: p.progress === 100 ? "#22643a" : "var(--brand-primary)",
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Upcoming Deadlines */}
              <div
                style={{
                  backgroundColor: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "14px",
                  padding: "20px 24px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "16px",
                  }}
                >
                  <h2 style={{ fontSize: "1.0625rem", fontWeight: 700, margin: 0, color: "var(--text-main)" }}>
                    Upcoming Project Deadlines
                  </h2>
                  <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>Earliest first</span>
                </div>

                {data.upcomingDeadlines.length === 0 ? (
                  <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", fontStyle: "italic", margin: "20px 0" }}>
                    No upcoming deadlines scheduled.
                  </p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {data.upcomingDeadlines.map((p) => {
                      const deadlineDate = new Date(p.deadline);
                      const today = new Date();
                      const diffTime = deadlineDate - today;
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      const isPast = diffDays < 0;

                      return (
                        <div
                          key={p._id}
                          style={{
                            padding: "12px 14px",
                            backgroundColor: isPast ? "var(--status-red-bg)" : "var(--bg-page)",
                            borderRadius: "10px",
                            border: `1px solid ${isPast ? "var(--status-red-border)" : "var(--border-subtle)"}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "12px",
                          }}
                        >
                          <div>
                            <Link
                              href={`/projects/${p._id}`}
                              style={{
                                fontSize: "0.875rem",
                                fontWeight: 600,
                                color: "var(--text-main)",
                                textDecoration: "none",
                              }}
                            >
                              {p.title}
                            </Link>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                              Client: {p.clientId?.name || "Client"}
                            </div>
                          </div>

                          <div style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                            <div
                              style={{
                                fontSize: "0.8125rem",
                                fontWeight: 700,
                                color: isPast ? "var(--status-red-text)" : "var(--text-main)",
                              }}
                            >
                              {deadlineDate.toLocaleDateString()}
                            </div>
                            <div
                              style={{
                                fontSize: "0.6875rem",
                                fontWeight: 600,
                                color: isPast ? "var(--status-red-text)" : "var(--text-muted)",
                              }}
                            >
                              {isPast ? "OVERDUE" : diffDays === 0 ? "Today" : `${diffDays} days left`}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Payment Activity */}
            <div
              style={{
                backgroundColor: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "14px",
                padding: "20px 24px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "16px",
                }}
              >
                <h2 style={{ fontSize: "1.0625rem", fontWeight: 700, margin: 0, color: "var(--text-main)" }}>
                  Recent Payment Activity
                </h2>
                <Link
                  href="/payments"
                  style={{ fontSize: "0.8125rem", color: "var(--brand-primary)", fontWeight: 600, textDecoration: "none" }}
                >
                  View All Payments &rarr;
                </Link>
              </div>

              {data.recentPayments.length === 0 ? (
                <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", fontStyle: "italic", margin: "16px 0" }}>
                  No recent payment records.
                </p>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.875rem" }}>
                    <thead>
                      <tr style={{ backgroundColor: "var(--bg-page)", borderBottom: "1px solid var(--border-subtle)" }}>
                        <th style={{ padding: "10px 14px", color: "var(--text-muted)", fontWeight: 600 }}>Amount</th>
                        <th style={{ padding: "10px 14px", color: "var(--text-muted)", fontWeight: 600 }}>Project</th>
                        <th style={{ padding: "10px 14px", color: "var(--text-muted)", fontWeight: 600 }}>Date</th>
                        <th style={{ padding: "10px 14px", color: "var(--text-muted)", fontWeight: 600 }}>Method</th>
                        <th style={{ padding: "10px 14px", color: "var(--text-muted)", fontWeight: 600 }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentPayments.map((p) => (
                        <tr key={p._id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                          <td style={{ padding: "12px 14px", fontWeight: 700, color: "var(--text-main)" }}>
                            ${(p.amount || 0).toLocaleString()}
                          </td>
                          <td style={{ padding: "12px 14px" }}>
                            {p.projectId ? (
                              <Link
                                href={`/projects/${p.projectId._id}`}
                                style={{ color: "var(--text-main)", textDecoration: "none", fontWeight: 500 }}
                              >
                                {p.projectId.title}
                              </Link>
                            ) : (
                              "Unassigned"
                            )}
                          </td>
                          <td style={{ padding: "12px 14px", color: "var(--text-muted)" }}>
                            {new Date(p.paymentDate).toLocaleDateString()}
                          </td>
                          <td style={{ padding: "12px 14px", color: "var(--text-muted)" }}>{p.paymentMethod}</td>
                          <td style={{ padding: "12px 14px" }}>
                            <StatusBadge status={p.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </>
  );
}

