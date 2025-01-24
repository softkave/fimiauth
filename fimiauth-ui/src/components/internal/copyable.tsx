import { toast } from "@/src/hooks/use-toast.js";
import { cn } from "@/src/lib/utils.js";
import { CheckIcon, CopyIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "../ui/button.js";

export interface ICopyableProps {
  children: React.ReactNode;
  produceText: () => string;
  className?: string;
}

export function Copyable({ children, produceText, className }: ICopyableProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = useCallback(() => {
    const text = produceText();
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    toast({
      title: "Copied to clipboard",
      description: text,
    });
  }, [produceText]);

  useEffect(() => {
    if (isCopied) {
      setTimeout(() => setIsCopied(false), 2000);
    }
  }, [isCopied]);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex-1">{children}</div>
      <Button onClick={handleCopy} variant="outline" size="icon">
        {isCopied ? (
          <CheckIcon className="w-4 h-4" />
        ) : (
          <CopyIcon className="w-4 h-4" />
        )}
      </Button>
    </div>
  );
}
