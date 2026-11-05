export default function StatusBadge({ status, type = "status" }) {
  if (!status) return null;

  // Map status or priority to color styling
  const getBadgeStyle = () => {
    const s = String(status).toLowerCase();

    // Completed / Success
    if (s === "completed" || s === "paid") {
      return {
        bg: "var(--status-green-bg)",
        text: "var(--status-green-text)",
        border: "var(--status-green-border)",
      };
    }

    // In Progress / Active
    if (s === "in progress") {
      return {
        bg: "var(--status-blue-bg)",
        text: "var(--status-blue-text)",
        border: "var(--status-blue-border)",
      };
    }

    // Pending / Planning / On Hold / Medium priority
    if (s === "pending" || s === "planning" || s === "on hold" || s === "medium") {
      return {
        bg: "var(--status-yellow-bg)",
        text: "var(--status-yellow-text)",
        border: "var(--status-yellow-border)",
      };
    }

    // High priority / Failed / Cancelled
    if (s === "high" || s === "failed" || s === "cancelled") {
      return {
        bg: "var(--status-red-bg)",
        text: "var(--status-red-text)",
        border: "var(--status-red-border)",
      };
    }

    // Low priority / To Do / Default neutral
    return {
      bg: "var(--status-gray-bg)",
      text: "var(--status-gray-text)",
      border: "var(--status-gray-border)",
    };
  };

  const style = getBadgeStyle();

  return (
    <span
      style={{
        backgroundColor: style.bg,
        color: style.text,
        border: `1px solid ${style.border}`,
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        padding: "2px 8px",
        borderRadius: "9999px",
        fontSize: "0.75rem",
        fontWeight: 600,
        letterSpacing: "0.02em",
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          backgroundColor: style.text,
        }}
      />
      {status}
    </span>
  );
}

