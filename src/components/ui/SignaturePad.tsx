import { useRef, useImperativeHandle, forwardRef, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui/Button";

interface SignaturePadProps {
  label: string;
  onChange?: (signature: string | null) => void;
  disabled?: boolean;
  initialValue?: string;
  height?: number;
  className?: string;
}

export interface SignaturePadRef {
  clear: () => void;
  getSignature: () => string | null;
  isEmpty: () => boolean;
}

export const SignaturePad = forwardRef<SignaturePadRef, SignaturePadProps>(
  ({ label, onChange, disabled, initialValue, height, className }, ref) => {
    const sigPad = useRef<SignatureCanvas>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      clear: () => {
        sigPad.current?.clear();
        onChange?.(null);
      },
      getSignature: () => {
        if (sigPad.current?.isEmpty()) return null;
        return sigPad.current?.getCanvas().toDataURL("image/png") || null;
      },
      isEmpty: () => sigPad.current?.isEmpty() ?? true,
    }));

    const handleEnd = () => {
      if (sigPad.current && !sigPad.current.isEmpty()) {
        onChange?.(sigPad.current.getCanvas().toDataURL("image/png"));
      }
    };

    useEffect(() => {
      if (initialValue && sigPad.current) {
        sigPad.current.fromDataURL(initialValue);
      }
    }, [initialValue]);

    useEffect(() => {
      const resizeCanvas = () => {
        if (containerRef.current && sigPad.current) {
          const canvas = sigPad.current.getCanvas();
          const ratio = Math.max(window.devicePixelRatio || 1, 1);
          canvas.width = containerRef.current.offsetWidth * ratio;
          canvas.height = containerRef.current.offsetHeight * ratio;
          canvas.getContext("2d")?.scale(ratio, ratio);

          if (initialValue) {
            sigPad.current.fromDataURL(initialValue);
          } else {
            sigPad.current.clear(); // Clear on resize to avoid distortion if empty
          }
        }
      };

      window.addEventListener("resize", resizeCanvas);
      // Initial resize
      setTimeout(resizeCanvas, 100);

      return () => window.removeEventListener("resize", resizeCanvas);
    }, [initialValue, height]);

    return (
      <div className={`space-y-2 ${className || ""}`}>
        <label className="text-sm font-medium text-text-subtle">{label}</label>
        <div
          ref={containerRef}
          style={{ height: height ? `${height}px` : undefined }}
          className={`border rounded-md bg-white overflow-hidden relative ${
            height ? "" : "h-40"
          } ${disabled ? "opacity-60 pointer-events-none" : "border-border"}`}
        >
          {disabled && initialValue ? (
            <img
              src={initialValue}
              alt="Firma"
              className="w-full h-full object-contain"
            />
          ) : (
            <SignatureCanvas
              ref={sigPad}
              penColor="black"
              canvasProps={{
                className: "signature-canvas w-full h-full",
              }}
              onEnd={handleEnd}
              onBegin={() => {}}
            />
          )}

          {!disabled && (
            <div className="absolute top-2 right-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs bg-slate-100 hover:bg-slate-200"
                onClick={() => {
                  sigPad.current?.clear();
                  onChange?.(null);
                }}
              >
                Limpiar
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  },
);

SignaturePad.displayName = "SignaturePad";
