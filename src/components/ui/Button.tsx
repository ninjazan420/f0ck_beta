import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium",
          "focus:outline-hidden focus:ring-2 focus:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          variant === "primary" && "bg-blue-600 text-white hover:bg-blue-700",
          variant === "secondary" &&
            "bg-gray-200 text-gray-900 hover:bg-gray-300",
          variant === "outline" &&
            "border border-gray-300 bg-transparent hover:bg-gray-100",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
