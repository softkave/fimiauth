import { toast } from "@/src/hooks/use-toast.js";
import { useEffect, useRef } from "react";
import { PageError } from "./error.js";
import { PageLoading } from "./loading.js";

export interface IWrapLoaderProps<T = any> {
  render: (data: T) => React.ReactNode;
  isLoading: boolean;
  error?: unknown;
  data?: T;
}

export function WrapLoader<T>({
  render,
  isLoading,
  error,
  data,
}: IWrapLoaderProps<T>) {
  const toastRef = useRef<ReturnType<typeof toast> | null>(null);

  useEffect(() => {
    if (data) {
      if (toastRef.current) {
        toastRef.current.dismiss();
      }

      if (isLoading) {
        toastRef.current = toast({
          title: "Loading...",
          description: "Fetching latest data",
          duration: Infinity,
        });
      } else if (error) {
        toastRef.current = toast({
          title: "Error",
          description:
            (error as Error | undefined)?.message || "An error occurred",
          duration: Infinity,
        });
      }

      return () => {
        toastRef.current?.dismiss();
      };
    }
  }, [data, isLoading]);

  if (data) {
    return render(data);
  } else if (isLoading) {
    return <PageLoading />;
  } else if (error) {
    return <PageError error={error} />;
  }

  return null;
}
