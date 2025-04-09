import * as React from "react";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  ToastIcon,
  ToastDetails,
  ToastDetail,
} from "@/components/ui/toast-enhanced";
import { useToast } from "@/components/ui/use-toast-enhanced";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, details, action, ...props }) => {
        return (
          <Toast key={id} {...props}>
            <div className="flex">
              {props.variant && <ToastIcon variant={props.variant} />}
              <div className="flex-1">
                <div className="flex justify-between">
                  {title && <ToastTitle>{title}</ToastTitle>}
                </div>
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
                {details && details.length > 0 && (
                  <ToastDetails>
                    {details.map((detail, index) => (
                      <ToastDetail
                        key={index}
                        label={detail.label}
                        value={detail.value}
                      />
                    ))}
                  </ToastDetails>
                )}
              </div>
            </div>
            {action}
            <ToastClose aria-label="Close" />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
