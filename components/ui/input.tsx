import * as React from "react";
import { cn } from "@/lib/utils";

// components/ui/input.tsx — champ de saisie (style shadcn/ui), aligné sur les
// formulaires existants (focus ring terracotta, hauteur 44 px).
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn(
      "flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm",
      className,
    )}
    ref={ref}
    {...props}
  />
));
Input.displayName = "Input";

export { Input };
