import * as React from "react";
import { Cross2Icon } from "@radix-ui/react-icons";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle, Info, XCircle } from "lucide-react";

export const ToastProvider = ToastPrimitives.Provider;

export const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:top-4 sm:right-0 sm:left-0 sm:mx-auto sm:flex-col md:max-w-[520px]",
      className,
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-start gap-4 overflow-hidden rounded-lg border p-4 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-top-full data-[state=open]:slide-in-from-top-full",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive:
          "destructive group border-destructive bg-destructive text-destructive-foreground",
        success:
          "success group border-green-500 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
        warning:
          "warning group border-yellow-500 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300",
        info: "info group border-blue-500 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  );
});
Toast.displayName = ToastPrimitives.Root.displayName;

export const ToastIcon = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "destructive" | "success" | "warning" | "info";
  }
>(({ className, variant = "default", ...props }, ref) => {
  const IconComponent = {
    default: Info,
    destructive: XCircle,
    success: CheckCircle,
    warning: AlertCircle,
    info: Info,
  }[variant];

  return (
    <div
      ref={ref}
      className={cn(
        "flex h-6 w-6 items-center justify-center",
        {
          "text-foreground": variant === "default",
          "text-destructive-foreground": variant === "destructive",
          "text-green-800 dark:text-green-300": variant === "success",
          "text-yellow-800 dark:text-yellow-300": variant === "warning",
          "text-blue-800 dark:text-blue-300": variant === "info",
        },
        className,
      )}
      {...props}
    >
      <IconComponent className="h-5 w-5" />
    </div>
  );
});
ToastIcon.displayName = "ToastIcon";

export const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors hover:bg-secondary focus:outline-none focus:ring-1 focus:ring-ring disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive group-[.success]:border-green-500/40 group-[.success]:hover:border-green-500 group-[.success]:hover:bg-green-100 dark:group-[.success]:hover:bg-green-900/30 group-[.success]:hover:text-green-800 dark:group-[.success]:hover:text-green-300 group-[.success]:focus:ring-green-500 group-[.warning]:border-yellow-500/40 group-[.warning]:hover:border-yellow-500 group-[.warning]:hover:bg-yellow-100 dark:group-[.warning]:hover:bg-yellow-900/30 group-[.warning]:hover:text-yellow-800 dark:group-[.warning]:hover:text-yellow-300 group-[.warning]:focus:ring-yellow-500 group-[.info]:border-blue-500/40 group-[.info]:hover:border-blue-500 group-[.info]:hover:bg-blue-100 dark:group-[.info]:hover:bg-blue-900/30 group-[.info]:hover:text-blue-800 dark:group-[.info]:hover:text-blue-300 group-[.info]:focus:ring-blue-500",
      className,
    )}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

export const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-1 top-1 rounded-md p-1 opacity-70 transition-opacity hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-1 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600 group-[.success]:text-green-800 dark:group-[.success]:text-green-300 group-[.success]:focus:ring-green-500 group-[.warning]:text-yellow-800 dark:group-[.warning]:text-yellow-300 group-[.warning]:focus:ring-yellow-500 group-[.info]:text-blue-800 dark:group-[.info]:text-blue-300 group-[.info]:focus:ring-blue-500",
      className,
    )}
    toast-close=""
    {...props}
  >
    <Cross2Icon className="h-4 w-4" />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

export const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold", className)}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

export const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

export const ToastDetails = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col gap-1 text-xs mt-1 opacity-80", className)}
    {...props}
  />
));
ToastDetails.displayName = "ToastDetails";

export const ToastDetail = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    label: string;
    value: string;
  }
>(({ className, label, value, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center justify-between", className)}
    {...props}
  >
    <span className="font-medium">{label}:</span>
    <span>{value}</span>
  </div>
));
ToastDetail.displayName = "ToastDetail";
