import React from "react";
import "./Sidebar.css";

const CATEGORY_ICONS = {
  default: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
};

export default function Sidebar({ categories, selected, onSelect }) {
  return (
    <aside className="sidebar-root">
      <div className="sidebar-header">
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
        <span>Categorías</span>
      </div>
      <ul className="sidebar-list">
        <li
          className={`sidebar-item ${!selected ? "active" : ""}`}
          onClick={() => onSelect("")}
        >
          <span className="sidebar-dot" />
          <span className="sidebar-item-label">Todas</span>
          {!selected && <span className="sidebar-active-indicator" />}
        </li>
        {categories.map((c) => (
          <li
            key={c}
            className={`sidebar-item ${selected === c ? "active" : ""}`}
            onClick={() => onSelect(c)}
          >
            <span className="sidebar-dot" />
            <span className="sidebar-item-label">{c}</span>
            {selected === c && <span className="sidebar-active-indicator" />}
          </li>
        ))}
      </ul>
    </aside>
  );
}
