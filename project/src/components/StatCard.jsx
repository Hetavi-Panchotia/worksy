export default function StatCard({ title, value, subtitle, icon, highlight = false }) {
  return (
    <div
      style={{
        backgroundColor: highlight ? "var(--brand-light)" : "var(--bg-surface)",
        border: `1px solid ${highlight ? "var(--brand-border)" : "var(--border-subtle)"}`,
        borderRadius: "12px",
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span
          style={{
            fontSize: "0.8125rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: highlight ? "var(--brand-primary)" : "var(--text-muted)",
          }}
        >
          {title}
        </span>
        {icon && (
          <span
            style={{
              fontSize: "1.25rem",
              opacity: 0.85,
            }}
          >
            {icon}
          </span>
        )}
      </div>

      <div
        style={{
          fontSize: "1.75rem",
          fontWeight: 700,
          color: highlight ? "var(--brand-primary)" : "var(--text-main)",
          letterSpacing: "-0.02em",
          lineHeight: 1.2,
        }}
      >
        {value}
      </div>

      {subtitle && (
        <span
          style={{
            fontSize: "0.8125rem",
            color: "var(--text-muted)",
          }}
        >
          {subtitle}
        </span>
      )}
    </div>
  );
}

