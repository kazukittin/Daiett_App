import React from "react";

const Button = ({ type = "button", variant = "primary", children, className = "", ...rest }) => {
  const classes = ["ds-button", variant, className].filter(Boolean).join(" ");
  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  );
};

export default Button;
