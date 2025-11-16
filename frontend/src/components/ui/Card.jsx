import React from "react";

const Card = ({ title, action, children, compact = false, surfaceMuted = false, className = "" }) => {
  const classes = [
    "ds-card",
    compact ? "compact" : "",
    surfaceMuted ? "surface-muted" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={classes}>
      {(title || action) && (
        <header className="flex-between">
          {title && <h3 className="ds-card-title">{title}</h3>}
          {action}
        </header>
      )}
      {children}
    </section>
  );
};

export default Card;
