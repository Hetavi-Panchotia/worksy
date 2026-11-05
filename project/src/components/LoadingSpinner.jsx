export default function LoadingSpinner({ text = "Loading..." }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 16px",
        gap: "12px",
        color: "var(--text-muted)",
      }}
    >
      <div
        style={{
          width: "28px",
          height: "28px",
          border: "3px solid var(--border-subtle)",
          borderTopColor: "var(--brand-primary)",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <span style={{ fontSize: "0.875rem" }}>{text}</span>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

