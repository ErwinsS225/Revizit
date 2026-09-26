import * as React from "react";
import { cn } from "@/lib/utils";

// components/ui/textarea.tsx — zone de texte (style shadcn/ui), utilisée pour
// les descriptions produits/catégories côté administration.
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => (
  <textarea
    className={cn(
      "flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm",
      className,
    )}
    ref={ref}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export { Textarea };
