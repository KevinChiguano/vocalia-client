import React, { createContext, useContext, ReactNode } from "react";
import { Modal } from "./Modal";

interface DialogContextType {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const Dialog = ({
  open,
  onOpenChange,
  children,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}) => {
  // If controlled, use props. If uncontrolled, we could add state, but usage shows controlled.
  // We'll assume controlled for now as per usage.
  if (open === undefined || onOpenChange === undefined) {
    console.warn("Dialog (mock) requires 'open' and 'onOpenChange' props");
    return null;
  }

  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
};

export const DialogTrigger = ({ asChild, children, ...props }: any) => {
  const { onOpenChange } = useContext(DialogContext)!;

  // Clone child to attach onClick
  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<any>;
    return React.cloneElement(child, {
      onClick: (e: any) => {
        child.props.onClick?.(e);
        onOpenChange(true);
      },
    });
  }

  return (
    <button onClick={() => onOpenChange(true)} {...props}>
      {children}
    </button>
  );
};

export const DialogContent = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  const { open, onOpenChange } = useContext(DialogContext)!;

  // We reuse the existing Modal component which handles the overlay and portal.
  return (
    <Modal isOpen={open} onClose={() => onOpenChange(false)} title="">
      <div className={className}>{children}</div>
    </Modal>
  );
};

export const DialogHeader = ({ children }: { children: ReactNode }) => (
  <div className="mb-4 space-y-1.5 text-center sm:text-left">{children}</div>
);

export const DialogTitle = ({ children }: { children: ReactNode }) => (
  <h3 className="text-lg font-semibold leading-none tracking-tight">
    {children}
  </h3>
);
