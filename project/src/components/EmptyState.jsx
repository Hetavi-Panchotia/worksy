export default function EmptyState({ icon = "📁", title, description, actionText, onAction }) {
  return (
    <div
      style={{
        backgroundColor: "var(--bg-surface)",
        border: "1px dashed var(--border-strong)",
        borderRadius: "14px",
        padding: "48px 24px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        margin: "16px 0",
      }}
    >
      <div style={{ fontSize: "2.5rem", marginBottom: "12px", opacity: 0.8 }}>
        {icon}
      </div>
      <h3
        style={{
          fontSize: "1.125rem",
          fontWeight: 600,
          color: "var(--text-main)",
          margin: "0 0 6px 0",
        }}
      >
        {title}
      </h3>
      {description && (
        <p
          style={{
            fontSize: "0.875rem",
            color: "var(--text-muted)",
            maxWidth: "380px",
            margin: "0 0 20px 0",
            lineHeight: 1.5,
          }}
        >
          {description}
        </p>
      )}
      {actionText && onAction && (
        <button
          onClick={onAction}
          style={{
            backgroundColor: "var(--brand-primary)",
            color: "#ffffff",
            border: "none",
            borderRadius: "8px",
            padding: "8px 16px",
            fontSize: "0.875rem",
            fontWeight: 500,
            cursor: "pointer",
            transition: "background-color 0.15s ease",
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "var(--brand-primary-hover)")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "var(--brand-primary)")}
        >
          {actionText}
        </button>
      )}
    </div>
  );
}

