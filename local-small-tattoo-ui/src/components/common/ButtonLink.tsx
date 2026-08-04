import type { ReactNode } from "react";
import { Link } from "react-router";

type ButtonLinkProps = {
  to: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "text";
  className?: string;
};

export function ButtonLink({
  to,
  children,
  variant = "primary",
  className = "",
}: ButtonLinkProps) {
  return (
    <Link className={`button button--${variant} ${className}`.trim()} to={to}>
      {children}
    </Link>
  );
}
