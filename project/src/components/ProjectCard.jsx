import Link from "next/link";
import StatusBadge from "./StatusBadge";

export default function ProjectCard({ project, onEdit, onDelete }) {
  const isOverdue =
    new Date(project.deadline) < new Date() &&
    project.status !== "Completed" &&
    project.status !== "Cancelled";

  const progress = project.taskStats ? project.taskStats.progress : 0;
  const totalPaid = project.financials ? project.financials.totalPaid : 0;
  const outstanding = project.financials ? project.financials.outstanding : project.budget;

  return (
    <div
      style={{
        backgroundColor: "var(--bg-surface)",
        border: `1px solid ${isOverdue ? "var(--status-red-border)" : "var(--border-subtle)"}`,
        borderRadius: "14px",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
        position: "relative",
      }}
    >
      <div>
        {/* Card Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "6px" }}>
              <StatusBadge status={project.status} />
              <StatusBadge status={project.priority} type="priority" />
              {isOverdue && (
                <span
                  style={{
                    backgroundColor: "var(--status-red-bg)",
                    color: "var(--status-red-text)",
                    border: "1px solid var(--status-red-border)",
                    padding: "2px 8px",
                    borderRadius: "9999px",
                    fontSize: "0.6875rem",
                    fontWeight: 700,
                  }}
                >
                  OVERDUE
                </span>
              )}
            </div>

            <Link
              href={`/projects/${project._id}`}
              style={{
                textDecoration: "none",
                fontSize: "1.125rem",
                fontWeight: 700,
                color: "var(--text-main)",
                lineHeight: 1.3,
                display: "block",
              }}
            >
              {project.title}
            </Link>

            {project.clientId && (
              <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginTop: "4px" }}>
                Client:{" "}
                <Link
                  href={`/clients/${project.clientId._id || project.clientId}`}
                  style={{
                    color: "var(--brand-primary)",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  {project.clientId.name || "Client"}
                </Link>
                {project.clientId.company ? ` (${project.clientId.company})` : ""}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: "6px" }}>
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(project);
                }}
                title="Edit project"
                style={{
                  background: "var(--bg-subtle)",
                  border: "none",
                  borderRadius: "6px",
                  padding: "6px 8px",
                  cursor: "pointer",
                  fontSize: "0.8125rem",
                }}
              >
                ✏️
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(project._id, project.title);
                }}
                title="Delete project"
                style={{
                  background: "var(--status-red-bg)",
                  border: "none",
                  borderRadius: "6px",
                  padding: "6px 8px",
                  cursor: "pointer",
                  fontSize: "0.8125rem",
                }}
              >
                🗑️
              </button>
            )}
          </div>
        </div>

        {/* Description */}
        {project.description && (
          <p
            style={{
              fontSize: "0.8125rem",
              color: "var(--text-muted)",
              marginTop: "12px",
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

        {/* Task Progress Bar */}
        <div style={{ marginTop: "16px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "0.75rem",
              marginBottom: "6px",
              color: "var(--text-muted)",
            }}
          >
            <span>
              Tasks ({project.taskStats?.completed || 0}/{project.taskStats?.total || 0})
            </span>
            <span style={{ fontWeight: 600, color: "var(--text-main)" }}>{progress}%</span>
          </div>
          <div
            style={{
              height: "6px",
              backgroundColor: "var(--bg-subtle)",
              borderRadius: "9999px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                backgroundColor: progress === 100 ? "#22643a" : "var(--brand-primary)",
                borderRadius: "9999px",
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>

        {/* Financial & Deadline stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
            marginTop: "16px",
            padding: "10px",
            backgroundColor: "var(--bg-page)",
            borderRadius: "8px",
            fontSize: "0.75rem",
          }}
        >
          <div>
            <div style={{ color: "var(--text-light)" }}>Budget / Received</div>
            <div style={{ fontWeight: 600, color: "var(--text-main)", marginTop: "2px" }}>
              ${(project.budget || 0).toLocaleString()} /{" "}
              <span style={{ color: "#22643a" }}>${totalPaid.toLocaleString()}</span>
            </div>
          </div>
          <div>
            <div style={{ color: "var(--text-light)" }}>Deadline</div>
            <div
              style={{
                fontWeight: 600,
                color: isOverdue ? "var(--status-red-text)" : "var(--text-main)",
                marginTop: "2px",
              }}
            >
              📅 {new Date(project.deadline).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div
        style={{
          marginTop: "16px",
          paddingTop: "12px",
          borderTop: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
          Outstanding: <strong style={{ color: "var(--text-main)" }}>${outstanding.toLocaleString()}</strong>
        </span>
        <Link
          href={`/projects/${project._id}`}
          style={{
            fontSize: "0.8125rem",
            fontWeight: 600,
            color: "var(--brand-primary)",
            textDecoration: "none",
          }}
        >
          View Dashboard &rarr;
        </Link>
      </div>
    </div>
  );
}

