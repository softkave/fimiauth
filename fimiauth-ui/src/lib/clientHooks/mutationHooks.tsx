import { toast } from "@/src/hooks/use-toast.js";
import { ToastAction } from "@radix-ui/react-toast";
import { useCallback } from "react";

export function useMutationFnWithRetry<TFn extends (...args: any[]) => any>(
  fn: TFn
) {
  const wrapper = useCallback(
    async (...args: Parameters<TFn>) => {
      try {
        return await fn(...args);
      } catch (error) {
        console.error(error);
        toast({
          title: "Error",
          description:
            (error as Error | undefined)?.message || "An error occurred",
          action: (
            <ToastAction altText="Retry" onClick={() => wrapper(...args)}>
              Retry
            </ToastAction>
          ),
        });
      }
    },
    [fn]
  );

  return wrapper;
}
