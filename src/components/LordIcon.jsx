// LordIcon.jsx
import React from "react";
export default function LordIcon({ src, trigger="hover", className="", style={}, ...rest }) {
  return (
    <lord-icon
      src={src}
      trigger={trigger}
      class={className}  // note: 'class' for web components
      style={style}
      {...rest}
    ></lord-icon>
  );
}