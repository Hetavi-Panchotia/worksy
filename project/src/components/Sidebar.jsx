"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/", icon: "📊" },
    { label: "Clients", href: "/clients", icon: "👥" },
    { label: "Projects", href: "/projects", icon: "📁" },
    { label: "Tasks", href: "/tasks", icon: "✓" },
    { label: "Payments", href: "/payments", icon: "💳" },
  ];

  const isActive = (href) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.3)",
            zIndex: 40,
            display: "block",
          }}
          className="md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        style={{
          width: "260px",
          backgroundColor: "#ffffff",
          borderRight: "1px solid var(--border-subtle)",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          transition: "transform 0.2s ease-in-out",
        }}
        className={`fixed inset-y-0 left-0 z-50 md:static md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div
          style={{
            padding: "24px 20px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link
            href="/"
            style={{
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                backgroundColor: "var(--brand-primary)",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: "1.125rem",
              }}
            >
              F
            </div>
            <div>
              <div
                style={{
                  fontSize: "1.0625rem",
                  fontWeight: 700,
                  color: "var(--text-main)",
                  lineHeight: 1.2,
                }}
              >
                FreelanceFlow
              </div>
              <div
                style={{
                  fontSize: "0.6875rem",
                  color: "var(--text-muted)",
                  letterSpacing: "0.03em",
                }}
              >
                worksy platform
              </div>
            </div>
          </Link>

          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="md:hidden"
            style={{
              background: "none",
              border: "none",
              fontSize: "1.25rem",
              cursor: "pointer",
              color: "var(--text-muted)",
              padding: "4px",
            }}
            aria-label="Close navigation"
          >
            ✕
          </button>
        </div>

        {/* Navigation Items */}
        <nav style={{ padding: "16px 12px", display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onClose && onClose()}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontSize: "0.9375rem",
                  fontWeight: active ? 600 : 500,
                  color: active ? "var(--brand-primary)" : "var(--text-main)",
                  backgroundColor: active ? "var(--brand-light)" : "transparent",
                  transition: "background-color 0.15s ease",
                }}
                onMouseOver={(e) => {
                  if (!active) e.currentTarget.style.backgroundColor = "var(--bg-subtle)";
                }}
                onMouseOut={(e) => {
                  if (!active) e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <span
                  style={{
                    fontSize: "1.125rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "22px",
                  }}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div
          style={{
            padding: "16px 20px",
            borderTop: "1px solid var(--border-subtle)",
            fontSize: "0.75rem",
            color: "var(--text-muted)",
            backgroundColor: "var(--bg-page)",
          }}
        >
          <div style={{ fontWeight: 600, color: "var(--text-main)" }}>College Evaluation Edition</div>
          <div style={{ marginTop: "2px" }}>Next.js App Router &bull; MongoDB</div>
        </div>
      </aside>
    </>
  );
}

