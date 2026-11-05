"use client";

export default function Header({
  title,
  subtitle,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  actionLabel,
  onActionClick,
  onToggleSidebar,
}) {
  return (
    <header
      style={{
        backgroundColor: "var(--bg-surface)",
        borderBottom: "1px solid var(--border-subtle)",
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        flexWrap: "wrap",
        position: "sticky",
        top: 0,
        zIndex: 30,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {/* Mobile menu trigger */}
        <button
          onClick={onToggleSidebar}
          className="md:hidden"
          style={{
            background: "none",
            border: "1px solid var(--border-subtle)",
            borderRadius: "6px",
            padding: "6px 10px",
            cursor: "pointer",
            fontSize: "1.125rem",
            color: "var(--text-main)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-label="Toggle navigation menu"
        >
          ☰
        </button>

        <div>
          <h1
            style={{
              fontSize: "1.375rem",
              fontWeight: 700,
              color: "var(--text-main)",
              margin: 0,
              letterSpacing: "-0.01em",
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              style={{
                fontSize: "0.8125rem",
                color: "var(--text-muted)",
                margin: "2px 0 0 0",
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginLeft: "auto",
        }}
      >
        {/* Optional Search Bar */}
        {onSearchChange !== undefined && (
          <div style={{ position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-light)",
                fontSize: "0.875rem",
                pointerEvents: "none",
              }}
            >
              🔍
            </span>
            <input
              type="text"
              value={searchValue || ""}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              style={{
                padding: "8px 14px 8px 34px",
                borderRadius: "8px",
                border: "1px solid var(--border-subtle)",
                backgroundColor: "var(--bg-page)",
                color: "var(--text-main)",
                fontSize: "0.875rem",
                outline: "none",
                width: "220px",
                transition: "border-color 0.15s ease",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--brand-primary)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border-subtle)")}
            />
          </div>
        )}

        {/* Primary Call to Action */}
        {actionLabel && onActionClick && (
          <button
            onClick={onActionClick}
            style={{
              backgroundColor: "var(--brand-primary)",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              padding: "8px 16px",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              transition: "background-color 0.15s ease",
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "var(--brand-primary-hover)")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "var(--brand-primary)")}
          >
            {actionLabel}
          </button>
        )}
      </div>
    </header>
  );
}

