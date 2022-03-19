import * as React from "react";

export type Props = React.ButtonHTMLAttributes<HTMLButtonElement>;

const ButtonBase = React.forwardRef<HTMLButtonElement, Props>((props, ref) => (
  <button
    {...props}
    ref={ref}
    style={{
      outline: "none",
      border: "none",
      cursor: "pointer",
      background: "none",
      // eslint-disable-next-line react/prop-types
      ...props.style,
    }}
  />
));

export default ButtonBase;
